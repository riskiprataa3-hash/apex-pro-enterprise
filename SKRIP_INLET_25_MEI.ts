import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

// ==========================================
// KONFIGURASI IMPORT 25 MEI 2026
// ==========================================

const NAMA_PROYEK = "PEKANBARU-DUMAI";
const JENIS_PEKERJAAN = "inlet"; // Tetap "inlet" agar menyatu ke dalam proyek utama, tidak terpisah
const TANGGAL_TEKS = "25 Mei 2026";
const KETERANGAN = "Non-Frame";
const UKURAN = "37x24";

const FOLDER_0 = 'dokumentasi O%';   
const FOLDER_50 = 'dokumentasi 5O%'; 
const FOLDER_100 = 'dokumentasi 10O%';

const DAFTAR_KM: string[] = [
"18+695 B/OS",
"18+670 B/OS",
"18+645 B/OS",
"18+620 B/OS",
"18+590 B/OS",
"18+565 B/OS",
"18+540 B/OS",
"18+515 B/OS",
"18+485 B/OS",
"18+460 B/OS",
"18+435 B/OS",
"18+410 B/OS",
"18+380 B/OS",
"18+355 B/OS",
"18+330 B/OS",
"18+305 B/OS",
"18+275 B/OS",
"18+250 B/OS",
"18+225 B/OS",
"18+200 B/OS",
"18+170 B/OS",
"18+145 B/OS",
"18+120 B/OS",
"18+095 B/OS",
"18+065 B/OS",
"18+040 B/OS",
"18+015 B/OS",
"17+990 B/OS",
"17+960 B/OS",
"17+935 B/OS",
"17+910 B/OS",
"17+885 B/OS",
"17+855 B/OS",
"17+830 B/OS",
"17+805 B/OS",
"17+780 B/OS",
"17+750 B/OS",
"17+725 B/OS",
"17+700 B/OS",
"17+675 B/OS",
"17+645 B/OS",
"17+620 B/OS",
"17+595 B/OS",
"17+570 B/OS",
"17+540 B/OS",
"17+515 B/OS",
"17+490 B/OS",
"17+465 B/OS",
"17+435 B/OS",
"17+410 B/OS",
"17+385 B/OS",
"17+360 B/OS",
"17+330 B/OS",
"17+305 B/OS",
"17+280 B/OS",
"17+255 B/OS",
"17+225 B/OS",
"17+200 B/OS"
];

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
    // Login otomatis sebagai admin
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');

    if (DAFTAR_KM.length === 0) {
        console.error("❌ GAGAL: Daftar KM masih kosong. Silakan lengkapi DAFTAR_KM terlebih dahulu.");
        process.exit(1);
    }

    const urls0 = await fetchUrls(FOLDER_0);
    const urls50 = await fetchUrls(FOLDER_50);
    const urls100 = await fetchUrls(FOLDER_100);

    if (urls0.length === 0 && urls50.length === 0 && urls100.length === 0) {
        console.error("\n❌ GAGAL: Tidak satupun foto ditemukan dari ketiga folder.");
        process.exit(1);
    }

    // Mencari ID Proyek Utama ("inlet", bukan "pemasangan inlet") agar entries-nya menyatu
    let pId = "";
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', JENIS_PEKERJAAN)));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes(NAMA_PROYEK.toUpperCase())) pId = d.id; 
    });

    if (!pId) {
        console.error(`❌ GAGAL: Proyek utama '${JENIS_PEKERJAAN}' tidak ditemukan! Pastikan nama & jenis pekerjaan sesuai.`);
        process.exit(1);
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

    console.log(`\n⏳ [DRY-RUN] Mempersiapkan data untuk ${DAFTAR_KM.length} Titik KM untuk tanggal ${TANGGAL_TEKS}...`);

    for (let i = 0; i < DAFTAR_KM.length; i++) {
        const km = DAFTAR_KM[i];
        
        const rnd0 = picker0.pick();
        const rnd50 = picker50.pick();
        const rnd100 = picker100.pick();

        // 1. FORMAT APLIKASI (Sub-collection entries dalam Project yg sama)
        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        const targetDate = new Date(2026, 4, 25, 10, i % 60, i % 60); // 25 May 2026

        currentBatch.set(appEntryRef, {
            km: km,
            signType: UKURAN,
            qty: 1,
            description: KETERANGAN,
            status: "completed",
            photos0: rnd0 ? [rnd0.url] : [],
            photos50: rnd50 ? [rnd50.url] : [],
            photos100: rnd100 ? [rnd100.url] : [],
            timestamp: targetDate.getTime(),
            ownerId: auth.currentUser!.uid,
            isArchived: false
        });
        currentBatchRefs.push(appEntryRef);

        // 2. FORMAT Laporan Report
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
            timestamp: targetDate.getTime()
        });
        currentBatchRefs.push(rawEntryRef);

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
        console.log(`✅ SUKSES! Sinkronisasi ${DAFTAR_KM.length} Titik KM 25 Mei Selesai beserta Audit-Trail! Data dimasukkan ke dalam Proyek Utama dengan aman.`);
    } catch (err) {
        console.error("❌ ERROR SAAT MENDORONG KE FIRESTORE. Terjadi kegagalan di tengah jalan!");
        process.exit(1);
    }
    process.exit(0);
}

run().catch(err => {
    console.error("❌ Terjadi Kesalahan Script:", err);
    process.exit(1);
});
