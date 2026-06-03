const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch, getDocs, query, where, collectionGroup } = require('firebase/firestore');
const { getStorage, ref, listAll, getDownloadURL } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { readFileSync } = require('fs');

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, "shaka-v4");
const storage = getStorage(app, "gs://" + (JSONconfig.storageBucket || "gen-lang-client-0223554772.firebasestorage.app"));

const NAMA_PROYEK = "PEKANBARU-DUMAI";
const JENIS_PEKERJAAN = "inlet";
const TANGGAL_TEKS = "02 Jun 2026";
const TANGGAL_TIMESTAMP = new Date("2026-06-02T10:00:00.000Z").getTime();
const KETERANGAN = "Frame";
const UKURAN = "37x24";

// Memperbarui folder sesuai permintaan terbaru dan foto list_storage.cjs
const FOLDER_0 = '(FRAME) 0%';   
const FOLDER_50 = '(FRAME) 50%'; 
const FOLDER_100 = '(FRAME) 100%';

// Sesuai revisi: "1 jalur nya buat A/OS,dan 25 nya A/OS-ON RAMP"
const listData = [
  "0+230 A/OS - ON RAMP",
  "0+235 A/OS - ON RAMP",
  "0+240 A/OS - ON RAMP",
  "0+245 A/OS - ON RAMP",
  "0+250 A/OS - ON RAMP",
  "0+255 A/OS - ON RAMP",
  "0+270 A/OS - ON RAMP",
  "0+275 A/OS - ON RAMP",
  "0+285 A/OS - ON RAMP",
  "0+290 A/OS - ON RAMP",
  "0+295 A/OS - ON RAMP",
  "0+300 A/OS - ON RAMP",
  "0+305 A/OS - ON RAMP",
  "0+315 A/OS - ON RAMP",
  "0+320 A/OS - ON RAMP",
  "0+325 A/OS - ON RAMP",
  "0+330 A/OS - ON RAMP",
  "0+360 A/OS - ON RAMP",
  "0+380 A/OS - ON RAMP",
  "0+390 A/OS - ON RAMP",
  "0+405 A/OS - ON RAMP",
  "0+435 A/OS - ON RAMP",
  "0+445 A/OS - ON RAMP",
  "0+450 A/OS - ON RAMP",
  "0+455 A/OS - ON RAMP",
  "01+350 A/OS"  // Yang 1 ini A/OS
];

async function fetchUrls(folderName) {
    console.log(`Mengambil URL foto dari folder Storage: ${folderName}...`);
    try {
        const folderRef = ref(storage, folderName);
        const res = await listAll(folderRef);
        console.log(`- Ditemukan ${res.items.length} item di ${folderName}`);
        
        // Fetch in parallel
        const urls = await Promise.all(res.items.map(async (item) => {
            try {
                const url = await getDownloadURL(item);
                return { url: url, name: item.name };
            } catch (err) {
                return null;
            }
        }));
        return urls.filter(Boolean);
    } catch (e) {
        console.error(`Gagal ekstrak Storage ${folderName}:`, e.message);
        return [];
    }
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

class SmartPhotoPicker {
    constructor(urls) {
        this.originalUrls = [...urls];
        this.pool = shuffleArray(this.originalUrls);
    }

    pick() {
        if (this.originalUrls.length === 0) return null;
        if (this.pool.length === 0) {
            this.pool = shuffleArray(this.originalUrls);
        }
        return this.pool.pop() || null;
    }
}

async function start() {
    console.log("Mulai log in ke firebase...");
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    console.log("Login sukses.");

    console.log(`Wiping existing ${TANGGAL_TEKS} data...`);
    
    // a) Wipe from inlet_reports
    const rawSnap = await getDocs(collection(db, 'inlet_reports'));
    let rawDeleteCount = 0;
    let batchRawDelete = writeBatch(db);
    rawSnap.forEach(d => {
        if (d.data().tanggal === TANGGAL_TEKS) {
            batchRawDelete.delete(doc(db, 'inlet_reports', d.id));
            rawDeleteCount++;
        }
    });
    if (rawDeleteCount > 0) {
        await batchRawDelete.commit();
        console.log(`- Berhasil menghapus ${rawDeleteCount} dokumen lama di inlet_reports.`);
    } else {
        console.log(`- Tidak ada dokumen lama untuk dihapus di inlet_reports.`);
    }

    // b) Wipe from projects collection entries (subcollections)
    const entriesSnap = await getDocs(collectionGroup(db, 'entries'));
    let entriesDeleteCount = 0;
    let batchEntriesDelete = writeBatch(db);
    let opDeleteCount = 0;
    
    for (const d of entriesSnap.docs) {
        if (d.data().dateDisplay === TANGGAL_TEKS && d.data().type === JENIS_PEKERJAAN) {
            batchEntriesDelete.delete(d.ref);
            entriesDeleteCount++;
            opDeleteCount++;
            if (opDeleteCount >= 400) {
                await batchEntriesDelete.commit();
                batchEntriesDelete = writeBatch(db);
                opDeleteCount = 0;
            }
        }
    }
    if (opDeleteCount > 0) {
        await batchEntriesDelete.commit();
    }
    console.log(`- Berhasil menghapus ${entriesDeleteCount} pecahan data lama di sub-collection entries.`);

    console.log("\nMengambil foto baru dari Storage yang sesuai (FRAME) O% / 5O% / 10O%...");
    const [fotos0, fotos50, fotos100] = await Promise.all([
        fetchUrls(FOLDER_0),
        fetchUrls(FOLDER_50),
        fetchUrls(FOLDER_100)
    ]);

    const picker0 = new SmartPhotoPicker(fotos0);
    const picker50 = new SmartPhotoPicker(fotos50);
    const picker100 = new SmartPhotoPicker(fotos100);

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

    let batch = writeBatch(db);
    let count = 0;
    let opCount = 0;

    for (const rawStr of listData) {
        let arah = "A/OS";
        if (rawStr.includes("A/OS - ON RAMP")) {
            arah = "A/OS - ON RAMP";
        }
        
        let km = rawStr.replace("A/OS - ON RAMP", "").replace("A/OS", "").trim();
        const finalKm = km + " " + arah;

        const rnd0 = picker0.pick();
        const rnd50 = picker50.pick();
        const rnd100 = picker100.pick();

        // Subcollection entries
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
            entryDesc: arah + " (" + KETERANGAN.toUpperCase() + ")",
            status: 'completed',
            photos0: rnd0 ? [rnd0.url] : [],
            photos50: rnd50 ? [rnd50.url] : [],
            photos100: rnd100 ? [rnd100.url] : [],
            isArchived: false,
            createdAt: Date.now(),
            createdBy: 'system'
        };
        batch.set(appEntryRef, entryData);
        opCount++;

        // inlet_reports
        const rawEntryRef = doc(collection(db, 'inlet_reports'));
        const rawData = {
            id: rawEntryRef.id,
            nama_proyek: NAMA_PROYEK,
            jenis_pekerjaan: "pemasangan inlet",
            tanggal: TANGGAL_TEKS,
            lokasi_km: finalKm,
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
            timestamp: TANGGAL_TIMESTAMP,
            projectId: pId,
            createdAt: Date.now(),
            createdBy: 'system'
        };
        batch.set(rawEntryRef, rawData);
        opCount++;
        count++;

        if (opCount >= 400) {
            console.log(`Memproses batch commit, opCount: ${opCount}...`);
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
        }
    }

    if (opCount > 0) {
        console.log(`Memproses sisa batch commit: ${opCount}...`);
        await batch.commit();
    }

    console.log(`\n=== SUKSES ULANG ===`);
    console.log(`- Berhasil memasukkan ${count} entri data bersih untuk tanggal ${TANGGAL_TEKS}!`);
    process.exit(0);
}

start().catch(err => {
    console.error("Terjadi error start:", err);
    process.exit(1);
});
