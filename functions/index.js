const { onObjectFinalized } = require("firebase-functions/v2/storage");
const admin = require("firebase-admin");
const sharp = require("sharp");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();

exports.compressImage = onObjectFinalized({ memory: "1GiB" }, async (event) => {
  const fileBucket = event.data.bucket; // Bucket tempat file tersimpan
  const filePath = event.data.name; // Path dari file di Storage
  const contentType = event.data.contentType; // Tipe konten
  
  // 1. Validasi: Pastikan event berasal dari gambar
  if (!contentType.startsWith("image/")) {
    console.log(`[Abort] File bukan gambar: ${filePath}`);
    return null;
  }

  // 2. Cegah Infinite Loop! Cek custom metadata apakah gambar sudah di-compress
  if (event.data.metadata && event.data.metadata.isCompressed === "true") {
    console.log(`[Abort] Gambar sudah dikompresi (skip untuk cegah loop): ${filePath}`);
    return null;
  }

  const fileName = path.basename(filePath);
  const bucket = admin.storage().bucket(fileBucket);

  const tempFilePath = path.join(os.tmpdir(), fileName);
  const tempCompressedPath = path.join(os.tmpdir(), `compressed_${fileName}`);

  try {
    const [oldMetadata] = await bucket.file(filePath).getMetadata();
    const oldToken = oldMetadata?.metadata?.firebaseStorageDownloadTokens || require('crypto').randomUUID();

    // 3. Download file gambar aslinya dari Cloud Storage ke temporary directory (RAM)
    console.log(`[Proses] Mengunduh file dari: ${filePath}`);
    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log("[Sukses] File berhasil diunduh.");

    // 4. Proses Resize dan Kompresi menggunakan library 'sharp'
    console.log("[Proses] Memulai kompresi dan resize...");
    await sharp(tempFilePath)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",   // Menjaga aspect ratio, maksimal 800x800
        withoutEnlargement: true // Tidak akan memperbesar gambar jika ukuran asli < 800x800
      })
      .jpeg({ 
        quality: 60, // Kompres ke JPEG dengan kualitas 60%
        mozjpeg: true
      })
      .toFile(tempCompressedPath);
    console.log("[Sukses] Gambar berhasil dikompresi.");

    // 5. Upload kembali file yang sudah di-compress dan TIMPA (overwrite) file yang lama
    console.log("[Proses] Mengunggah file terkompresi...");
    await bucket.upload(tempCompressedPath, {
      destination: filePath, // Upload ke path yang SAMA (overwrite)
      metadata: {
        contentType: "image/jpeg",
        metadata: {
          isCompressed: "true", // Menandai file agar tidak diproses berulang-ulang
          firebaseStorageDownloadTokens: oldToken
        }
      }
    });
    console.log(`[Sukses] File tujuan diperbarui secara berhasil: ${filePath}`);

    // Membersihkan memori & menghapus file sementara
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempCompressedPath);

    return null;
  } catch (error) {
    console.error("[Error] Terjadi kesalahan dalam proses kompresi:", error);
    
    // Pastikan membersihkan temp file meskipun terjadi error
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(tempCompressedPath)) fs.unlinkSync(tempCompressedPath);
    
    return null;
  }
});

exports.proxyImage = require("firebase-functions/v2/https").onRequest({ cors: true, memory: "256MiB" }, async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      res.status(400).send("Missing url");
      return;
    }
    
    // We are running on Node 20+, so fetch is native.
    const fetchResponse = await fetch(targetUrl);
    if (!fetchResponse.ok) {
      res.status(fetchResponse.status).send(`Failed to fetch ${fetchResponse.statusText}`);
      return;
    }
    
    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = fetchResponse.headers.get("content-type") || "image/jpeg";
    
    const base64 = buffer.toString('base64');
    res.status(200).send(`data:${contentType};base64,${base64}`);
  } catch (error) {
    console.error("Proxy HTTP error:", error);
    res.status(500).send("Error fetching image");
  }
});
