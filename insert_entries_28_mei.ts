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
const TANGGAL_TEKS = "28 Mei 2026";
const UKURAN = "37x24";

const FOLDER_0 = 'dokumentasi O%';   
const FOLDER_50 = 'dokumentasi 5O%'; 
const FOLDER_100 = 'dokumentasi 10O%';

const DATA_ENTRIES = [
  // A/OS (Frame unless specified Non-Frame)
  { km: "24+590 A/OS", keterangan: "Frame" },
  { km: "24+605 A/OS", keterangan: "Frame" },
  { km: "24+615 A/OS", keterangan: "Frame" },
  { km: "24+695 A/OS", keterangan: "Frame" },
  { km: "24+700 A/OS", keterangan: "Frame" },
  { km: "24+715 A/OS", keterangan: "Frame" },
  { km: "24+720 A/OS", keterangan: "Frame" },
  { km: "24+725 A/OS", keterangan: "Frame" },
  { km: "24+730 A/OS", keterangan: "Frame" },
  { km: "24+745 A/OS", keterangan: "Frame" },
  { km: "24+785 A/OS", keterangan: "Frame" },
  { km: "24+790 A/OS", keterangan: "Frame" },
  { km: "24+795 A/OS", keterangan: "Non-Frame" }, // Explicit NON FRAME
  { km: "24+800 A/OS", keterangan: "Frame" },
  { km: "14+805 A/OS", keterangan: "Frame" },
  { km: "24+870 A/OS", keterangan: "Frame" },

  // B/OS (Non-Frame unless specified Frame)
  { km: "12+100 B/OS", keterangan: "Non-Frame" },
  { km: "12+080 B/OS", keterangan: "Non-Frame" },
  { km: "12+060 B/OS", keterangan: "Non-Frame" },
  { km: "11+660 B/OS", keterangan: "Non-Frame" },
  { km: "11+495 B/OS", keterangan: "Non-Frame" },
  { km: "11+490 B/OS", keterangan: "Non-Frame" },
  { km: "11+365 B/OS", keterangan: "Frame" }, // Explicit FRAME
  { km: "11+360 B/OS", keterangan: "Non-Frame" },
  { km: "11+270 B/OS", keterangan: "Non-Frame" },
  { km: "11+255 B/OS", keterangan: "Non-Frame" },
  { km: "11+245 B/OS", keterangan: "Non-Frame" },
  { km: "11+240 B/OS", keterangan: "Non-Frame" },
  { km: "11+230 B/OS", keterangan: "Non-Frame" },
  { km: "11+205 B/OS", keterangan: "Non-Frame" },
  { km: "11+065 B/OS", keterangan: "Non-Frame" },
  { km: "11+015 B/OS", keterangan: "Non-Frame" },
  { km: "10+990 B/OS", keterangan: "Non-Frame" },
  { km: "10+910 B/OS", keterangan: "Non-Frame" },
  { km: "10+895 B/OS", keterangan: "Non-Frame" },
  { km: "10+885 B/OS", keterangan: "Frame" }, // Explicit FRAME
  { km: "10+810 B/OS", keterangan: "Non-Frame" },
  { km: "10+775 B/OS", keterangan: "Non-Frame" },
  { km: "10+475 B/OS", keterangan: "Non-Frame" },
  { km: "10+470 B/OS", keterangan: "Non-Frame" },
  { km: "10+465 B/OS", keterangan: "Non-Frame" }
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
    console.log("Logged in successfully");

    const items0 = await fetchUrlRefs(FOLDER_0);
    const items50 = await fetchUrlRefs(FOLDER_50);
    const items100 = await fetchUrlRefs(FOLDER_100);

    let pId = "";
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', JENIS_PEKERJAAN)));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes(NAMA_PROYEK.toUpperCase())) pId = d.id; 
    });

    if (!pId) {
        console.error("Project ID not found for PEKANBARU-DUMAI inlet!");
        process.exit(1);
    }
    console.log("Project ID:", pId);

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

    for (let i = 0; i < DATA_ENTRIES.length; i++) {
        const entry = DATA_ENTRIES[i];
        const km = entry.km;
        const keterangan = entry.keterangan;

        const i0 = p0[idx0++ % p0.length];
        const i50 = p50[idx50++ % p50.length];
        const i100 = p100[idx100++ % p100.length];

        const [url0, url50, url100] = await Promise.all([
            getDownloadURL(i0),
            getDownloadURL(i50),
            getDownloadURL(i100)
        ]);

        const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
        // 28 Mei 2026. Month index logic: Month 4 is May.
        // Distribute timestamps throughout the afternoon/evening so they are uniquely ordered and natural.
        const targetDate = new Date(2026, 4, 28, 12, Math.floor((i * 10) / 60), (i * 10) % 60);

        // Standard formatting for 'date' and 'createdDay'
        const dateStr = "2026-05-28";
        const createdDayStr = "28/5/2026";

        currentBatch.set(appEntryRef, {
            km: km,
            signType: UKURAN,
            qty: 1,
            description: keterangan,
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
            type: JENIS_PEKERJAAN,
            date: dateStr,
            createdDay: createdDayStr
        });

        const rawEntryRef = doc(collection(db, 'inlet_reports'));
        currentBatch.set(rawEntryRef, {
            nama_proyek: NAMA_PROYEK,
            jenis_pekerjaan: JENIS_PEKERJAAN,
            tanggal: TANGGAL_TEKS,
            lokasi_km: km,
            km: km,
            ukuran: UKURAN,
            jumlah: 1, 
            foto_0: url0, 
            foto_50: url50,
            foto_100: url100,
            originalFileName0: i0.name,
            originalFileName50: i50.name,
            originalFileName100: i100.name,
            keterangan: keterangan,
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

    // Add a summary logging activity
    const actEntryRef = doc(collection(db, 'activities'));
    currentBatch.set(actEntryRef, {
        type: 'entry',
        action: 'CREATED',
        title: 'Input Data Baru (Massal)',
        description: `Import massal 41 data harian oleh admin untuk tanggal 28 Mei 2026 (${NAMA_PROYEK})`,
        projectId: pId,
        userId: auth.currentUser!.uid,
        userEmail: auth.currentUser!.email?.toLowerCase() || 'adminshaka01@gmail.com',
        timestamp: Date.now()
    });
    opCount += 1;

    if (opCount > 0) batches.push(currentBatch);

    console.log(`Mengirim data ke Firestore dalam ${batches.length} batch...`);
    for (const b of batches) {
        await b.commit();
    }
    console.log(`Sukses memasukkan ${DATA_ENTRIES.length} entri proyek untuk tanggal ${TANGGAL_TEKS}!`);
    process.exit(0);
}

run().catch(err => {
    console.error("Terjadi error saat menjalankan script:", err);
    process.exit(1);
});
