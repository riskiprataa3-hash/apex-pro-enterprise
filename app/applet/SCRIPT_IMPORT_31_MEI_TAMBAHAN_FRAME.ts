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
const TANGGAL_TEKS = "31 Mei 2026";
const TANGGAL_TIMESTAMP = new Date("2026-05-31T10:00:00.000Z").getTime();
// Use FRAME folders as requested
const FOLDER_0 = 'DOKUMENTASI FRAME 0%';   
const FOLDER_50 = 'DOKUMENTASI FRAME 50%'; 
const FOLDER_100 = 'DOKUMENTASI FRAME 100%';

const rawKM = [
  "74+630",
  "74+635",
  "74+740",
  "74+745",
  "74+750",
  "74+755",
  "74+800",
  "74+810",
  "74+820",
  "74+830",
  "74+845",
  "74+855",
  "74+860",
  "74+865",
  "74+870",
  "74+880",
  "74+885",
  "74+895",
  "74+900",
  "74+905",
  "74+910",
  "74+915",
  "74+920",
  "74+925",
  "74+930",
  "74+935",
  "74+940",
  "74+945",
  "74+960",
  "74+995"
];

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
        console.error(`Gagal ekstrak Storage ${folderName}:`, e.message);
        return [];
    }
}

function getRandomPhoto(urls: string[]) {
    if (urls.length === 0) return null;
    return urls[Math.floor(Math.random() * urls.length)];
}

async function runImport() {
    console.log(`=== MEMULAI IMPORT DATA ${TANGGAL_TEKS} PEKANBARU-DUMAI ===`);
    
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    console.log("Login sukses.");
    
    const fotos0 = await fetchUrls(FOLDER_0);
    const fotos50 = await fetchUrls(FOLDER_50);
    const fotos100 = await fetchUrls(FOLDER_100);
    
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', JENIS_PEKERJAAN)));
    let pId = "";
    pDocs.forEach(d => {
       const pd = d.data();
       if (pd.name && pd.name.toUpperCase().includes(NAMA_PROYEK)) {
           pId = d.id;
       }
    });

    if (!pId) {
       console.log("ERROR: Project PEKANBARU-DUMAI inlet tidak ditemukan.");
       return;
    }

    console.log(`Ditemukan Project ID: ${pId}`);

    const batch = writeBatch(db);
    let count = 0;

    for (let km of rawKM) {
        let arah = "A/OS";
        
        let kmClean = km.trim();
        const finalKm = kmClean + " " + arah;

        const f0 = getRandomPhoto(fotos0);
        const f50 = getRandomPhoto(fotos50);
        const f100 = getRandomPhoto(fotos100);

        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        const entryData = {
            id: appEntryRef.id,
            projectId: pId,
            km: finalKm,
            arah: arah,
            type: JENIS_PEKERJAAN,
            dateDisplay: TANGGAL_TEKS,
            timestamp: TANGGAL_TIMESTAMP,
            qty: 1,
            lajur: arah,
            entryDesc: arah + " (FRAME)",
            status: 'completed',
            photos0: f0 ? [f0] : [],
            photos50: f50 ? [f50] : [],
            photos100: f100 ? [f100] : [],
            isArchived: false,
            createdAt: Date.now(),
            createdBy: 'system'
        };
        batch.set(appEntryRef, entryData);
        console.log(`Menambahkan: ${finalKm}`);
        count++;
    }

    await batch.commit();
    console.log(`SUKSES: ${count} entri data berhasil dimasukkan!`);
    process.exit(0);
}

runImport();
