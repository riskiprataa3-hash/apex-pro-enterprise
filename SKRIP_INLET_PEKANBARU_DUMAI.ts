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
const JENIS_PEKERJAAN = "inlet";
const TANGGAL_TEKS = "22 Mei 2026";
const KETERANGAN = "Non-Frame";
const UKURAN = "37x24";

// Pastikan penulisan folder persis dengan yang ada di Firebase Storage
// Cek huruf besar O atau angka 0 (nol) agar foto berhasil terbaca
const FOLDER_0 = 'dokumentasi O%';   
const FOLDER_50 = 'dokumentasi 5O%'; 
const FOLDER_100 = 'dokumentasi 10O%';

// 👇👇👇 MASUKAN DAFTAR KM DI SINI 👇👇👇
const DAFTAR_KM = [
"22+200 B/OS",
"22+190 B/OS",
"22+180 B/OS",
"22+175 B/OS",
"22+165 B/OS",
"22+155 B/OS",
"22+150 B/OS",
"22+140 B/OS",
"22+130 B/OS",
"22+125 B/OS",
"22+115 B/OS",
"22+105 B/OS",
"22+100 B/OS",
"22+090 B/OS",
"22+080 B/OS",
"22+075 B/OS",
"22+065 B/OS",
"22+055 B/OS",
"22+050 B/OS",
"22+040 B/OS",
"22+030 B/OS",
"22+025 B/OS",
"22+015 B/OS",
"22+005 B/OS",
"22+000 B/OS",
"21+990 B/OS",
"21+980 B/OS",
"21+975 B/OS",
"21+965 B/OS",
"21+955 B/OS",
"21+950 B/OS",
"21+940 B/OS",
"21+930 B/OS",
"21+925 B/OS",
"21+915 B/OS",
"21+905 B/OS",
"21+900 B/OS",
"21+890 B/OS",
"21+880 B/OS",
"21+875 B/OS",
"21+865 B/OS",
"21+860 B/OS",
"21+850 B/OS",
"21+845 B/OS",
"21+835 B/OS",
"21+830 B/OS",
"21+820 B/OS",
"21+815 B/OS",
"21+805 B/OS",
"21+800 B/OS"
];
// 👆👆👆 MASUKAN DAFTAR KM DI SINI 👆👆👆

// ==========================================

type PhotoData = { url: string; name: string };

async function fetchUrls(folderName: string): Promise<PhotoData[]> {
    console.log(`Mengambil URL foto dari folder Storage: ${folderName}...`);
    try {
        const folderRef = ref(storage, folderName);
        const res = await listAll(folderRef);
        const urls: PhotoData[] = [];
        for (const item of res.items) {
            urls.push({
                url: await getDownloadURL(item),
                name: item.name
            });
        }
        console.log(`- Berhasil mendapat ${urls.length} foto dari ${folderName}`);
        return urls;
    } catch (e: any) {
        console.error(`Peringatan: Gagal menemukan/membaca isi dari folder '${folderName}'.`);
        return [];
    }
}

async function run() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');

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

    function shuffleArray<T>(array: T[]): T[] {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    class SmartPhotoPicker {
        private originalUrls: PhotoData[];
        private pool: PhotoData[];

        constructor(urls: PhotoData[]) {
            this.originalUrls = [...urls];
            this.pool = shuffleArray(this.originalUrls);
        }

        pick(): PhotoData | null {
            if (this.originalUrls.length === 0) return null;
            if (this.pool.length === 0) {
                this.pool = shuffleArray(this.originalUrls);
            }
            return this.pool.pop() || null;
        }
    }

    const picker0 = new SmartPhotoPicker(urls0);
    const picker50 = new SmartPhotoPicker(urls50);
    const picker100 = new SmartPhotoPicker(urls100);

    let batches: any[] = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;
    let committedDocRefs: any[] = [];
    let currentBatchRefs: any[] = [];

    console.log(`\n⏳ [DRY-RUN] Mempersiapkan data untuk ${DAFTAR_KM.length} Titik KM (Pembersihan Otomatis aktif)...`);

    // LOOPING KE MASING-MASING KM & MENGAMBIL FOTO SECARA ACAK
    for (let i = 0; i < DAFTAR_KM.length; i++) {
        const km = DAFTAR_KM[i];
        
        // Mengambil foto secara cerdas (Smart Random Shuffle)
        const rnd0 = picker0.pick();
        const rnd50 = picker50.pick();
        const rnd100 = picker100.pick();

        // 1. FORMAT APLIKASI (Sub-collection entries)
        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        currentBatch.set(appEntryRef, {
            km: km,
            signType: UKURAN,
            qty: 1,
            description: KETERANGAN,
            status: "completed",
            photos0: rnd0 ? [rnd0.url] : [],
            photos50: rnd50 ? [rnd50.url] : [],
            photos100: rnd100 ? [rnd100.url] : [],
            timestamp: Date.now(),
            ownerId: auth.currentUser!.uid,
            isArchived: false
        });
        currentBatchRefs.push(appEntryRef);

        // 2. FORMAT EXPORT PDF / DATA RAW KASAR (Koleksi inlet_reports)
        const rawEntryRef = doc(collection(db, 'inlet_reports'));
        currentBatch.set(rawEntryRef, {
            nama_proyek: NAMA_PROYEK,
            jenis_pekerjaan: JENIS_PEKERJAAN,
            tanggal: TANGGAL_TEKS,
            lokasi_km: km,
            ukuran: UKURAN,
            jumlah: 1, 
            foto_0: rnd0 ? rnd0.url : null, 
            foto_50: rnd50 ? rnd50.url : null,
            foto_100: rnd100 ? rnd100.url : null,
            originalFileName0: rnd0 ? rnd0.name : null,
            originalFileName50: rnd50 ? rnd50.name : null,
            originalFileName100: rnd100 ? rnd100.name : null,
            keterangan: KETERANGAN,
            status_kemajuan: "100% DONE",
            timestamp: Date.now()
        });
        currentBatchRefs.push(rawEntryRef);

        // Simpan Batch Tiap 400 Kali Insert
        opCount += 2;
        if (opCount >= 400) {
            batches.push({ batch: currentBatch, refs: currentBatchRefs });
            currentBatch = writeBatch(db);
            currentBatchRefs = [];
            opCount = 0;
        }
    }

    if (opCount > 0) {
        batches.push({ batch: currentBatch, refs: currentBatchRefs });
    }

    console.log("✅ Persiapan lokal (Dry-Run) selesai. Mulai melakukan Mendorong ke Firestore...");

    try {
        for (let i = 0; i < batches.length; i++) {
            await batches[i].batch.commit();
            committedDocRefs.push(...batches[i].refs);
            console.log(`- Batch ${i + 1}/${batches.length} berhasil didorong...`);
        }
        console.log(`✅ SUKSES! Sinkronisasi ${DAFTAR_KM.length} Titik KM beserta Audit-Trail nama file asli berhasil diselesaikan dengan aman!`);
    } catch (err) {
        console.error("❌ ERROR SAAT MENDORONG KE FIRESTORE. Terjadi kegagalan di tengah jalan!");
        console.error("⏳ Memulai sistem Rollback (Pembersihan Otomatis) untuk mencegah data terpisah belah...");
        try {
            let rollbackBatch = writeBatch(db);
            let rollbackCount = 0;
            for (const ref of committedDocRefs) {
                rollbackBatch.delete(ref);
                rollbackCount++;
                if (rollbackCount >= 400) {
                    await rollbackBatch.commit();
                    rollbackBatch = writeBatch(db);
                    rollbackCount = 0;
                }
            }
            if (rollbackCount > 0) {
                await rollbackBatch.commit();
            }
            console.log("✅ Pembersihan Otomatis (Rollback) berhasil. Tidak ada data gagal/setengah matang yang tersisa.");
        } catch (rollbackErr) {
            console.error("❌ GAGAL ROLLBACK! Beberapa data mungkin tersisa. Hubungi tenaga IT.", rollbackErr);
        }
        process.exit(1);
    }
    process.exit(0);
}

run().catch(err => {
    console.error("❌ Terjadi Kesalahan Script:", err);
    process.exit(1);
});
