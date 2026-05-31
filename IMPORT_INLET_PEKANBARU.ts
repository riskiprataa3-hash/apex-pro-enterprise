import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, setDoc, query, where } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

// =========================================================================
// SCRIPT IMPORT INLET PEKANBARU-DUMAI (VERSI ACAK FOTO OTOMATIS)
// -------------------------------------------------------------------------
// Script ini akan mengambil dokumentasi di storage, dan mengacaknya (random)
// sehingga berapapun foto yang Anda miliki di folder tersebut, 
// akan didistribusikan ke setiap titik KM yang Anda tentukan secara acak.
// =========================================================================

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

// ==========================================
// KONFIGURASI IMPORT
// ==========================================

const NAMA_PROYEK = "PEKANBARU-DUMAI";
const JENIS_PEKERJAAN = "Inlet";
const TANGGAL_TEKS = "18 Mei 2026";
const KETERANGAN = "Non-Frame";
const UKURAN = "37x24";

// Pastikan penulisan folder persis dengan yang ada di Firebase Storage
const FOLDER_0 = 'dokumentasi O%';   
const FOLDER_50 = 'dokumentasi 5O%'; 
const FOLDER_100 = 'dokumentasi 10O%';

// 👇👇👇 MASUKAN DAFTAR KM DI SINI 👇👇👇
const DAFTAR_KM = [
  "22+400", 
  "22+405", 
  "22+410", 
  "22+415", 
  "22+420",
  // Tambahkan titik KM lainnya sesuai kebutuhan...
];
// 👆👆👆 MASUKAN DAFTAR KM DI SINI 👆👆👆

// ==========================================

async function fetchUrls(folderName: string) {
    console.log(`Mengambil URL foto dari folder Storage: ${folderName}...`);
    try {
        const folderRef = ref(storage, folderName);
        const res = await listAll(folderRef);
        const urls: string[] = [];
        for (const item of res.items) {
            urls.push(await getDownloadURL(item));
        }
        console.log(`- Berhasil mendapat ${urls.length} foto dari ${folderName}`);
        return urls;
    } catch (e: any) {
        console.error(`Peringatan: Gagal menemukan/membaca isi dari folder '${folderName}'.`);
        return [];
    }
}

async function run() {
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');

    // MENGAMBIL SEMUA FOTO DARI MASING-MASING FOLDER
    const urls0 = await fetchUrls(FOLDER_0);
    const urls50 = await fetchUrls(FOLDER_50);
    const urls100 = await fetchUrls(FOLDER_100);

    // Filter bila tidak ada foto satupun
    if (urls0.length === 0 && urls50.length === 0 && urls100.length === 0) {
        console.error("\n❌ GAGAL: Tidak satupun foto ditemukan dari ketiga folder.");
        process.exit(1);
    }

    // MENCARI / MEMBUAT PROYEK REFERENSI
    let pId = "";
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', JENIS_PEKERJAAN.toLowerCase())));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes(NAMA_PROYEK.toUpperCase())) pId = d.id; 
    });

    if (!pId) {
        console.log(`Proyek '${NAMA_PROYEK}' tidak ditemukan, membuat proyek ${JENIS_PEKERJAAN} otomatis...`);
        const newProj = doc(collection(db, 'projects'));
        await setDoc(newProj, {
            name: NAMA_PROYEK,
            type: JENIS_PEKERJAAN.toLowerCase(),
            status: 'active',
            isArchived: false,
            createdAt: Date.now(),
            ownerId: auth.currentUser!.uid,
            locationInfo: 'Jalan Tol Trans Sumatera',
            regionalInfo: 'Regional SUMBAGTENG'
        });
        pId = newProj.id;
    }

    let batch = writeBatch(db);
    let opCount = 0;

    console.log(`\n⏳ Mulai mensinkronisasi data ke ${DAFTAR_KM.length} Titik KM dengan foto acak...`);

    // LOOPING KE MASING-MASING KM & MENGAMBIL FOTO SECARA ACAK
    for (let i = 0; i < DAFTAR_KM.length; i++) {
        const km = DAFTAR_KM[i];
        
        // Mengambil foto secara acak (Random)
        const rnd0 = urls0.length > 0 ? urls0[Math.floor(Math.random() * urls0.length)] : null;
        const rnd50 = urls50.length > 0 ? urls50[Math.floor(Math.random() * urls50.length)] : null;
        const rnd100 = urls100.length > 0 ? urls100[Math.floor(Math.random() * urls100.length)] : null;

        // 1. FORMAT APLIKASI (Sub-collection entries)
        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        batch.set(appEntryRef, {
            km: km,
            signType: UKURAN,
            qty: 1,
            description: KETERANGAN,
            status: "completed",
            photos0: rnd0 ? [rnd0] : [],
            photos50: rnd50 ? [rnd50] : [],
            photos100: rnd100 ? [rnd100] : [],
            timestamp: Date.now(),
            ownerId: auth.currentUser!.uid,
            isArchived: false
        });

        // 2. FORMAT EXPORT PDF / DATA RAW KASAR (Koleksi inlet_reports)
        const rawEntryRef = doc(collection(db, 'inlet_reports'));
        batch.set(rawEntryRef, {
            nama_proyek: NAMA_PROYEK,
            jenis_pekerjaan: JENIS_PEKERJAAN,
            tanggal: TANGGAL_TEKS,
            lokasi_km: km,
            ukuran: UKURAN,
            jumlah: 1, 
            foto_0: rnd0, 
            foto_50: rnd50,
            foto_100: rnd100,
            keterangan: KETERANGAN,
            status_kemajuan: "100% DONE",
            timestamp: Date.now()
        });

        // Simpan Batch Tiap 400 Kali Insert
        opCount += 2;
        if (opCount >= 400) {
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
        }
    }

    if (opCount > 0) {
        await batch.commit();
    }

    console.log(`✅ SUKSES! Sinkronisasi ${DAFTAR_KM.length} Titik KM Selesai dengan foto Acak!`);
    process.exit(0);
}

run().catch(err => {
    console.error("❌ Terjadi Kesalahan Script:", err);
    process.exit(1);
});
