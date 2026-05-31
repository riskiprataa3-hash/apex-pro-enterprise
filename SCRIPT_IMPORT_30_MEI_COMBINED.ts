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
const TANGGAL_TEKS = "30 Mei 2026";
const TANGGAL_TIMESTAMP = new Date("2026-05-30T10:00:00.000Z").getTime();
const KETERANGAN = "A/OS (FRAME) - (NON FRAME)";

// Use FRAME folders as requested
const FOLDER_0 = 'DOKUMENTASI FRAME 0%';   
const FOLDER_50 = 'DOKUMENTASI FRAME 50%'; 
const FOLDER_100 = 'DOKUMENTASI FRAME 100%';

const listData = [
  "60+285",
  "60+310",
  "60+335",
  "60+510",
  "60+920",
  "61+165",
  "61+170",
  "61+175",
  "61+180",
  "61+185",
  "61+190",
  "61+195",
  "61+200",
  "61+205",
  "61+210",
  "61+215",
  "61+220",
  "61+225",
  "61+230",
  "61+235",
  "61+240",
  "61+245",
  "61+250",
  "61+255",
  "61+260",
  "61+265",
  "61+270",
  "51+275",
  "61+280",
  "61+285",
  "61+290",
  "61+295",
  "61+300",
  "61+305",
  "61+310",
  "61+315",
  "61+320",
  "61+325",
  "61+330",
  "61+335",
  "61+425",
  "74+400",
  "74+435",
  "74+470",
  "74+505",
  "74+545",
  "74+580",
  "74+620",
  "74+655",
  "74+690",
  "74+730",
  "74+765",
  "74+800"
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

    for (const km of listData) {
        const arah = "A/OS";

        const f0 = getRandomPhoto(fotos0);
        const f50 = getRandomPhoto(fotos50);
        const f100 = getRandomPhoto(fotos100);

        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        const entryData = {
            id: appEntryRef.id,
            projectId: pId,
            km: km.trim(),
            arah: arah,
            type: JENIS_PEKERJAAN,
            dateDisplay: TANGGAL_TEKS,
            timestamp: TANGGAL_TIMESTAMP,
            qty: 1,
            lajur: arah,
            entryDesc: KETERANGAN,
            status: 'completed',
            photos0: f0 ? [f0] : [],
            photos50: f50 ? [f50] : [],
            photos100: f100 ? [f100] : [],
            isArchived: false
        };
        batch.set(appEntryRef, entryData);
        count++;
    }

    await batch.commit();
    console.log(`SUKSES: ${count} entri data berhasil dimasukkan!`);
    process.exit(0);
}

runImport();
