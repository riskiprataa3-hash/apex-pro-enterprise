import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
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
"24+800 B/OS",
"24+780 B/OS",
"24+775 B/OS",
"24+770 B/OS",
"24+665 B/OS",
"24+500 B/OS"
];

type PhotoData = { url: string; name: string };

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

    class SmartPhotoPicker {
        private originalItems: any[];
        private pool: any[];

        constructor(items: any[]) {
            this.originalItems = [...items];
            this.pool = shuffleArray(this.originalItems);
        }

        async pick(): Promise<PhotoData | null> {
            if (this.originalItems.length === 0) return null;
            if (this.pool.length === 0) {
                this.pool = shuffleArray(this.originalItems);
            }
            const item = this.pool.pop();
            if(!item) return null;
            return {
                url: await getDownloadURL(item),
                name: item.name
            };
        }
    }

    const picker0 = new SmartPhotoPicker(items0);
    const picker50 = new SmartPhotoPicker(items50);
    const picker100 = new SmartPhotoPicker(items100);

    let batches: any[] = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;

    for (let i = 0; i < DAFTAR_KM.length; i++) {
        const km = DAFTAR_KM[i].trim();
        
        const rnd0 = await picker0.pick();
        const rnd50 = await picker50.pick();
        const rnd100 = await picker100.pick();

        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        const targetDate = new Date(2026, 4, 26, 14, i % 60, i % 60);

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
            isArchived: false,
            foto_0: rnd0 ? rnd0.url : null,
            foto_50: rnd50 ? rnd50.url : null,
            foto_100: rnd100 ? rnd100.url : null,
        });

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
            timestamp: targetDate.getTime(),
            photos0: rnd0 ? [rnd0.url] : [],
            photos50: rnd50 ? [rnd50.url] : [],
            photos100: rnd100 ? [rnd100.url] : []
        });

        opCount += 2;
    }

    if (opCount > 0) batches.push(currentBatch);

    for (const b of batches) await b.commit();
    console.log("Done inserting 6 more entries for May 26");
    process.exit(0);
}

run();
