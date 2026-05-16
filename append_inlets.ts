import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));

async function appendLaporan() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, "shaka-prod-v3");
  const storage = getStorage(app);
  const batch = writeBatch(db);
  const collectionRef = collection(db, "inlet_reports");

  const projectId = "TbtZli8c6XY3AGtWjls5"; // PEKANBARU-DUMAI

  // 1. Ambil URL Foto dari Storage
  const getURLs = async (path: string) => {
    try {
      console.log(`Fetching URLs from storage: ${path}...`);
      const folderRef = ref(storage, path);
      const res = await listAll(folderRef);
      if (res.items.length === 0) {
        console.log(`No items in storage folder ${path}, using placeholders.`);
        return [`https://placehold.co/600x400?text=${path}_Placeholder`];
      }
      return await Promise.all(res.items.map((item) => getDownloadURL(item)));
    } catch (e: any) {
      console.log(`Error fetching ${path}: ${e.message}, using placeholders.`);
      return [`https://placehold.co/600x400?text=${path}_Error`];
    }
  };

  const urls0 = await getURLs('dokumentasi_0');
  const urls50 = await getURLs('dokumentasi_50');
  const urls100 = await getURLs('dokumentasi_100');

  const getRandomPhoto = (list: string[]) => list[Math.floor(Math.random() * list.length)];

  // 2. Definisi Segmen sesuai Revisi
  const segmenData = [
    { start: 20235, end: 20400, jumlah: 13 },
    { start: 20400, end: 20600, jumlah: 8 },
    { start: 20600, end: 20800, jumlah: 13 },
    { start: 20800, end: 21000, jumlah: 16 },
    { start: 21000, end: 21200, jumlah: 23 }
  ];

  let totalInserted = 0;

  segmenData.forEach(segmen => {
    let titikTersedia = [];
    for (let m = segmen.start; m <= segmen.end; m += 5) {
      titikTersedia.push(m);
    }

    // Acak urutan KM dan ambil sebanyak jumlah lubang
    const titikTerpilih = titikTersedia.sort(() => 0.5 - Math.random()).slice(0, segmen.jumlah);

    titikTerpilih.forEach(kmValue => {
      const newDocRef = doc(collectionRef); // Generate NEW Auto-ID
      
      const kmUtama = Math.floor(kmValue / 1000);
      const kmSisa = kmValue % 1000;
      const kmString = `${kmUtama}+${String(kmSisa).padStart(3, '0')}`;

      batch.set(newDocRef, {
        projectId: projectId,
        lokasi_km: kmString,
        km_numeric: kmValue,
        ukuran: "37x24",
        jumlah: 1,
        note: "non frame",
        foto_0: getRandomPhoto(urls0),
        foto_50: getRandomPhoto(urls50),
        foto_100: getRandomPhoto(urls100),
        timestamp: new Date(),
        createdAt: Date.now(),
        server_timestamp: serverTimestamp()
      });
      totalInserted++;
    });
  });

  // 3. Eksekusi Batch ke shaka-prod-v3
  try {
    console.log(`Adding ${totalInserted} new records to shaka-prod-v3.inlet_reports...`);
    await batch.commit();
    console.log("✅ Berhasil! 73 data revisi sudah masuk ke database shaka-prod-v3.");
  } catch (error) {
    console.error("❌ Gagal:", error);
  }
}

appendLaporan();
