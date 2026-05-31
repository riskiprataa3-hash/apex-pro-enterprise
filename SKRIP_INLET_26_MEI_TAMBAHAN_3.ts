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

const NAMA_PROYEK = "PEKANBARU-DUMAI";
const JENIS_PEKERJAAN = "inlet"; 
const TANGGAL_TEKS = "26 Mei 2026";
const KETERANGAN = "Non-Frame";
const UKURAN = "37x24";

const FOLDER_0 = 'dokumentasi O%';   
const FOLDER_50 = 'dokumentasi 5O%'; 
const FOLDER_100 = 'dokumentasi 10O%';

const DAFTAR_KM: string[] = [
"18+045 B/OS",
"18+010 B/OS",
"18+005 B/OS",
"17+000 B/OS",
"17+995 B/OS",
"17+990 B/OS",
"16+620 B/OS",
"16+200 B/OS",
"12+450 B/OS",
"12+550 B/OS",
"12+555 B/OS",
"12+560 B/OS",
"12+565 B/OS",
"12+955 B/OS",
"12+950 B/OS",
"12+945 B/OS",
"12+940 B/OS",
"12+935 B/OS",
"12+925 B/OS",
"12+910 B/OS",
"12+905 B/OS",
"12+875 B/OS",
"12+860 B/OS",
"12+855 B/OS",
"12+850 B/OS",
"12+810 B/OS",
"12+805 B/OS",
"12+795 B/OS",
"12+770 B/OS",
"12+760 B/OS",
"12+755 B/OS",
"12+750 B/OS",
"12+745 B/OS",
"12+740 B/OS",
"12+735 B/OS",
"12+730 B/OS",
"12+725 B/OS",
"12+720 B/OS",
"12+715 B/OS",
"12+710 B/OS",
"12+705 B/OS",
"12+700 B/OS",
"12+695 B/OS",
"12+690 B/OS",
"12+685 B/OS",
"12+680 B/OS",
"12+675 B/OS"
];

async function fetchUrlRefs(folderName: string): Promise<any[]> {
    console.log(`Mengambil referensi foto dari folder Storage: ${folderName}...`);
    try {
        const folderRef = ref(storage, folderName);
        const res = await listAll(folderRef);
        console.log(`- Berhasil mendapat ${res.items.length} referensi foto dari ${folderName}`);
        return res.items;
    } catch (e: any) {
        console.error(`Peringatan: Gagal menemukan/membaca isi dari folder '${folderName}'.`);
        return [];
    }
}

async function run() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');

    const items0 = await fetchUrlRefs(FOLDER_0);
    const items50 = await fetchUrlRefs(FOLDER_50);
    const items100 = await fetchUrlRefs(FOLDER_100);

    let pId = "";
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', JENIS_PEKERJAAN)));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes(NAMA_PROYEK.toUpperCase())) pId = d.id; 
    });

    if (!pId) {
        console.error("Project ID not found");
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

    const p0 = shuffleArray(items0);
    const p50 = shuffleArray(items50);
    const p100 = shuffleArray(items100);
    let idx0 = 0, idx50 = 0, idx100 = 0;

    let batches: any[] = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;

    for (let i = 0; i < DAFTAR_KM.length; i++) {
        const km = DAFTAR_KM[i].trim();
        
        const i0 = p0[idx0++ % p0.length];
        const i50 = p50[idx50++ % p50.length];
        const i100 = p100[idx100++ % p100.length];

        const [url0, url50, url100] = await Promise.all([
            getDownloadURL(i0),
            getDownloadURL(i50),
            getDownloadURL(i100)
        ]);

        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        const targetDate = new Date(2026, 4, 26, 15, i % 60, i % 60);

        currentBatch.set(appEntryRef, {
            km: km,
            signType: UKURAN,
            qty: 1,
            description: KETERANGAN,
            status: "completed",
            photos0: [url0],
            photos50: [url50],
            photos100: [url100],
            timestamp: targetDate.getTime(),
            ownerId: auth.currentUser!.uid,
            isArchived: false,
            foto_0: url0,
            foto_50: url50,
            foto_100: url100,
        });

        const rawEntryRef = doc(collection(db, 'inlet_reports'));
        currentBatch.set(rawEntryRef, {
            nama_proyek: NAMA_PROYEK,
            jenis_pekerjaan: JENIS_PEKERJAAN,
            tanggal: TANGGAL_TEKS,
            lokasi_km: km,
            ukuran: UKURAN,
            jumlah: 1, 
            foto_0: url0, 
            foto_50: url50,
            foto_100: url100,
            originalFileName0: i0.name,
            originalFileName50: i50.name,
            originalFileName100: i100.name,
            keterangan: KETERANGAN,
            status_kemajuan: "100% DONE",
            timestamp: targetDate.getTime(),
            photos0: [url0],
            photos50: [url50],
            photos100: [url100]
        });

        opCount += 2;
        if (opCount >= 400) {
            batches.push(currentBatch);
            currentBatch = writeBatch(db);
            opCount = 0;
        }
    }

    if (opCount > 0) batches.push(currentBatch);

    for (const b of batches) await b.commit();
    console.log(`Done inserting ${DAFTAR_KM.length} entries for May 26 (with authentic photos from storage folders)`);
    process.exit(0);
}

run();
