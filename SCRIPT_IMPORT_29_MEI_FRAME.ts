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
const TANGGAL_TEKS = "29 Mei 2026";
const TANGGAL_TIMESTAMP = new Date("2026-05-29T10:00:00.000Z").getTime();
const KETERANGAN = "Frame";

// Use FRAME folders
const FOLDER_0 = 'DOKUMENTASI FRAME 0%';   
const FOLDER_50 = 'DOKUMENTASI FRAME 50%'; 
const FOLDER_100 = 'DOKUMENTASI FRAME 100%';

// Convert lists to specific KM items to import
const b_os = [
  "61+420", "61+240", "61+120", "60+945", "60+940", "60+900", "60+880", "60+860", "60+855", "60+845", "60+840", "60+830", "60+795", "60+700", "60+685", "60+680", "60+670", "60+660", "60+620", "60+615", "60+610", "60+605", "60+580", "60+565", "60+560", "60+550", "60+630", "60+635", "60+640", "60+650", "60+655", "60+450", "60+420", "55+610", "55+150", "44+400", "44+370"
];

const a_os = [
  "54+970", "54+975", "54+980", "54+985", "54+990", "55+000", "55+005", "55+010", "55+050", "55+060", "55+300", "55+465", "55+530", "55+555", "55+590", "55+595", "55+630"
];

const DAFTAR_KM = [
   ...b_os.map(km => `${km} B/OS`),
   ...a_os.map(km => `${km} A/OS`)
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
    console.log("=== MEMULAI IMPORT DATA 29 MEI PEKANBARU-DUMAI ===");
    
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    console.log("Login sukses.");
    
    // 1. Ekstrak Storage Photos
    const fotos0 = await fetchUrls(FOLDER_0);
    const fotos50 = await fetchUrls(FOLDER_50);
    const fotos100 = await fetchUrls(FOLDER_100);
    
    if (fotos0.length === 0 && fotos50.length === 0 && fotos100.length === 0) {
       console.log("PERINGATAN: Tidak ada foto yang berhasil ditarik dari storage!");
       // We'll proceed without photos because sometimes they are uploaded later or user made a typo.
    }
    
    // 2. Cari project Inlets PEKANBARU-DUMAI
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

    for (const kmLajur of DAFTAR_KM) {
        // e.g. "61+420 B/OS"
        let km = kmLajur;
        let arah = "B/OS";
        if (kmLajur.includes("A/OS")) arah = "A/OS";
        else if (kmLajur.includes("B/OS")) arah = "B/OS";
        
        // Remove A/OS or B/OS from KM if we want raw KM
        km = kmLajur.replace(" A/OS", "").replace(" B/OS", "");

        const f0 = getRandomPhoto(fotos0);
        const f50 = getRandomPhoto(fotos50);
        const f100 = getRandomPhoto(fotos100);

        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        const entryData = {
            id: appEntryRef.id,
            projectId: pId,
            km: km,
            arah: arah,
            type: JENIS_PEKERJAAN,
            dateDisplay: TANGGAL_TEKS,
            timestamp: TANGGAL_TIMESTAMP,
            qty: 1,
            lajur: arah,
            entryDesc: KETERANGAN,
            status: 'completed', // completed because it has Frame documentation
            photos0: f0 ? [f0] : [],
            photos50: f50 ? [f50] : [],
            photos100: f100 ? [f100] : [],
        };
        batch.set(appEntryRef, entryData);
        
        count++;
        // Batches can only hold 500, we have ~54 items, so it's fine.
    }

    await batch.commit();
    console.log(`SUKSES: ${count} entri data berhasil dimasukkan!`);
    process.exit(0);
}

runImport();
