const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch, getDocs, setDoc, query, where } = require('firebase/firestore');
const { getStorage, ref, listAll, getDownloadURL } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, JSONconfig.firestoreDatabaseId);
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

const NAMA_PROYEK = "PEKANBARU-DUMAI";
const JENIS_PEKERJAAN = "inlet";
const TANGGAL_TEKS = "18 Mei 2026";
const KETERANGAN = "Non-Frame";
const UKURAN = "37x24";

const FOLDER_0 = 'dokumentasi O%';   
const FOLDER_50 = 'dokumentasi 5O%'; 
const FOLDER_100 = 'dokumentasi 10O%';

const DAFTAR_KM = [
"23+350 B", "23+345 B", "23+340 B", "23+335 B",
"23+330 B", "23+325 B", "23+320 B", "23+315 B",
"23+310 B", "23+305 B", "23+300 B", "23+295 B",
"23+290 B", "23+288 B", "23+285 B", "23+280 B",
"23+275 B", "23+270 B", "23+265 B", "23+260 B",
"23+255 B", "23+250 B", "23+245 B", "23+240 B",
"23+235 B", "23+230 B", "23+225 B", "23+220 B",
"23+215 B", "23+210 B", "23+208 B", "23+205 B",
"23+200 B", "23+195 B", "23+190 B", "23+185 B",
"23+180 B", "23+175 B", "23+170 B", "23+165 B",
"23+160 B", "23+158 B", "23+155 B", "23+150 B",
"23+145 B", "23+140 B", "23+135 B", "23+130 B",
"23+128 B", "23+125 B", "23+120 B", "23+115 B",
"23+110 B", "23+105 B", "23+100 B", "23+098 B",
"23+095 B", "23+090 B", "23+085 B", "23+080 B"
];

async function fetchUrls(folderName) {
    console.log(`Mengambil URL foto dari folder Storage: ${folderName}...`);
    try {
        const folderRef = ref(storage, folderName);
        const res = await listAll(folderRef);
        const urls = [];
        for (const item of res.items) {
            urls.push(await getDownloadURL(item));
        }
        console.log(`- Berhasil mendapat ${urls.length} foto dari ${folderName}`);
        return urls;
    } catch (e) {
        console.error(`Peringatan: Gagal menemukan/membaca isi dari folder '${folderName}'.`);
        return [];
    }
}

async function run() {
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');

    const urls0 = await fetchUrls(FOLDER_0);
    const urls50 = await fetchUrls(FOLDER_50);
    const urls100 = await fetchUrls(FOLDER_100);

    let pId = "";
    // Temukan proyek inlet PEKANBARU-DUMAI
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', JENIS_PEKERJAAN)));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes(NAMA_PROYEK.toUpperCase())) pId = d.id; 
    });

    if (!pId) {
        console.log('Project not found, creating dummy');
        const newProj = doc(collection(db, 'projects'));
        await setDoc(newProj, {
            name: NAMA_PROYEK,
            type: JENIS_PEKERJAAN.toLowerCase(),
            status: 'active',
            isArchived: false,
            createdAt: Date.now(),
            ownerId: auth.currentUser.uid,
            locationInfo: 'Jalan Tol Trans Sumatera',
            regionalInfo: 'Regional SUMBAGTENG'
        });
        pId = newProj.id;
    }

    let batch = writeBatch(db);
    let opCount = 0;
    
    const baseDate = new Date("2026-05-18T10:00:00+07:00");

    console.log(`\n⏳ Mulai mensinkronisasi data ke ${DAFTAR_KM.length} Titik KM dengan foto acak...`);

    for (let i = 0; i < DAFTAR_KM.length; i++) {
        const km = DAFTAR_KM[i];
        
        const rnd0 = urls0.length > 0 ? urls0[Math.floor(Math.random() * urls0.length)] : null;
        const rnd50 = urls50.length > 0 ? urls50[Math.floor(Math.random() * urls50.length)] : null;
        const rnd100 = urls100.length > 0 ? urls100[Math.floor(Math.random() * urls100.length)] : null;

        const timestamp_ms = baseDate.getTime() + (i * 60 * 1000);

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
            timestamp: timestamp_ms,
            createdDay: new Date(timestamp_ms).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" }),
            serverTimestamp: new Date(timestamp_ms),
            ownerId: auth.currentUser.uid,
            isArchived: false,
            type: JENIS_PEKERJAAN
        });

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
            timestamp: timestamp_ms
        });

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
