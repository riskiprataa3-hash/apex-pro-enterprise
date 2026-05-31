import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, setDoc, query, where } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

// 1. Inisialisasi Firebase
const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

// ==========================================
// KONFIGURASI IMPORT
// Silakan ubah bagian ini sesuai kebutuhan!
// ==========================================

// Nama Proyek (Harus sama dengan yang ada di aplikasi, atau akan dibuat baru jika tidak ada)
const NAMA_PROYEK = "PEKANBARU-DUMAI";

// Keterangan khusus (Misal "Non-Frame" atau "Frame")
const KETERANGAN = "Non-Frame";

// Tanggal Pekerjaan
const TANGGAL_TEKS = "18 Mei 2026";
const TANGGAL_TIMESTAMP = Date.now(); // Tanggal input. Bisa juga diganti ke new Date('2026-05-18T00:00:00Z').getTime()

// Nama-nama folder di Firebase Storage tempat foto diupload
// Ingat: pastikan ejaan persis sama dengan yang di storage (apakah pakai huruf O atau angka 0)
const FOLDER_0 = 'dokumentasi O%';    // atau 'dokumentasi 0%' 
const FOLDER_50 = 'dokumentasi 5O%';  // atau 'dokumentasi 50%'
const FOLDER_100 = 'dokumentasi 10O%'; // atau 'dokumentasi 100%'

// Daftar Titik KM yang dikerjakan secara berurutan
// Urutan KM di bawah akan dicocokkan dengan urutan foto di Storage (dari A ke Z)
// PASTIKAN JUMLAHNYA SAMA DENGAN JUMLAH FOTO DI STORAGE (ATAU FOTO AKAN DI-LOOP / DIULANG SECARA OTOMATIS JIKA KURANG)
const DAFTAR_KM = [
  "22+400", "22+405", "22+410", "22+415", "22+420", "22+425", "22+430",
  // << Tambahkan KM lainnya di sini >>
];

// ==========================================

async function fetchUrls(folderName: string) {
    console.log(`Mengambil URL foto dari folder Storage: ${folderName}...`);
    const folderRef = ref(storage, folderName);
    const res = await listAll(folderRef);
    
    // Urutkan berdasarkan nama file agar urutannya selalu sama (A-Z)
    const items = res.items.sort((a, b) => a.name.localeCompare(b.name));
    
    const urls: string[] = [];
    for (const item of items) {
        urls.push(await getDownloadURL(item));
    }
    console.log(`Berhasil mendapat ${urls.length} foto dari ${folderName}`);
    return urls;
}

async function run() {
    // Login Admin secara otomatis
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
    console.log("Login sukses sebagai sistem terotorisasi.");

    // Ambil foto dari Storage ke dalam URL publik
    const urls0 = await fetchUrls(FOLDER_0);
    const urls50 = await fetchUrls(FOLDER_50);
    const urls100 = await fetchUrls(FOLDER_100);

    // Filter bila tidak ada foto sama sekali
    if (urls0.length === 0 && urls50.length === 0 && urls100.length === 0) {
        console.error("⚠️ Peringatan: Tidak ada foto di Firebase Storage pada folder yang di set!");
        process.exit(1);
    }

    // Jika jumlah foto kurang dari KM, akan di-loop / ulang pakai operator % (modulo)
    if (urls0.length < DAFTAR_KM.length || urls50.length < DAFTAR_KM.length || urls100.length < DAFTAR_KM.length) {
        console.warn(`\n⚠️ PERINGATAN: Jumlah foto kurang dari jumlah titik KM!`);
        console.warn(`- Jumlah Titik KM: ${DAFTAR_KM.length}`);
        console.warn(`- Foto 0%: ${urls0.length}`);
        console.warn(`- Foto 50%: ${urls50.length}`);
        console.warn(`- Foto 100%: ${urls100.length}`);
        console.warn(`Sistem akan me-loop foto yang ada secara otomatis untuk mengisi kekurangan.\n`);
    }

    // Cek Project di Firestore (Tabel projects)
    let pId = "";
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', 'inlet')));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes(NAMA_PROYEK.toUpperCase())) pId = d.id; 
    });

    if (!pId) {
        console.log(`Proyek '${NAMA_PROYEK}' tidak ditemukan, membuat proyek inlet baru...`);
        const newProj = doc(collection(db, 'projects'));
        await setDoc(newProj, {
            name: NAMA_PROYEK,
            type: 'inlet',
            status: 'active',
            isArchived: false,
            createdAt: Date.now(),
            ownerId: auth.currentUser!.uid,
            locationInfo: 'Jalan Tol Trans Sumatera',
            regionalInfo: 'Regional SUMBAGTENG'
        });
        pId = newProj.id;
    }
    console.log(`ID Proyek yang di tuju: ${pId}`);

    let batch = writeBatch(db);
    let opCount = 0;

    for (let i = 0; i < DAFTAR_KM.length; i++) {
        const km = DAFTAR_KM[i];
        
        // Ambil URL dengan teknik "Modulo / Loop" jika foto kurang (i % urls.length)
        const p0 = urls0.length > 0 ? urls0[i % urls0.length] : null;
        const p50 = urls50.length > 0 ? urls50[i % urls50.length] : null;
        const p100 = urls100.length > 0 ? urls100[i % urls100.length] : null;

        // 1. FORMAT APLIKASI (Untuk Database Dashboard / Manajemen Project)
        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        batch.set(appEntryRef, {
            km: km,
            signType: "37x24",
            qty: 1, // Jika ukuran bukan 1, ubah di sini
            description: KETERANGAN,
            status: "completed",
            // Jika ada fotonya, kita masukkan sebagai string array karena App membaca array
            photos0: p0 ? [p0] : [],
            photos50: p50 ? [p50] : [],
            photos100: p100 ? [p100] : [],
            timestamp: TANGGAL_TIMESTAMP,
            ownerId: auth.currentUser!.uid,
            isArchived: false
        });

        // 2. FORMAT DATABASE RAW (Untuk Tabel Reports Independen)
        const rawEntryRef = doc(collection(db, 'inlet_reports'));
        batch.set(rawEntryRef, {
            nama_proyek: NAMA_PROYEK,
            jenis_pekerjaan: "Inlet",
            tanggal: TANGGAL_TEKS,
            lokasi_km: km,
            ukuran: "37x24",
            jumlah: 1, // Jika jumlah bisa dinamik, ubah di sini
            foto_0: p0, // Raw biasa berupa string, bukan array
            foto_50: p50,
            foto_100: p100,
            keterangan: KETERANGAN,
            status_kemajuan: "100% DONE",
            timestamp: TANGGAL_TIMESTAMP
        });

        opCount += 2; // Karena kita mengupdate 2 schema database yang berbeda format secara bersamaan

        // Firebase Batch limit adalah 500 iterasi insert per block, kita batasi per 400
        if (opCount >= 400) {
            console.log(`Commit database, menulis 200 KM pertama...`);
            await batch.commit();
            batch = writeBatch(db); // Buka batch baru
            opCount = 0;
        }
    }

    if (opCount > 0) {
        await batch.commit();
    }

    console.log(`\n✅ SUKSES! ${DAFTAR_KM.length} entri pemasangan inlet berhasil disinkronisasi ke Cloud Firestore dan di cocokan dengan Storage!`);
    process.exit(0);
}

run().catch(err => {
    console.error("❌ Terjadi Kesalahan Script:", err);
    process.exit(1);
});
