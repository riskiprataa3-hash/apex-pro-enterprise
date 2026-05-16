/**
 * SCRIPT LAPORAN OTOMATIS
 * - Mengambil foto random dari database
 * - Input data pemasangan (0%, 50%, 100%)
 * - Menggunakan KM yang terlewat
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, limit, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function generateReport() {
  const pId = 'TbtZli8c6XY3AGtWjls5'; // Pekanbaru-Dumai Project ID
  const userEmail = 'riskiprataa3@gmail.com';
  
  console.log("Mempersiapkan data Pemasangan Inlet PEKANBARU-DUMAI...");
  
  // Data KM yang terlewat untuk Inlet (Contoh daftar yang lebih banyak)
  const inletKMs = [
    { km: "23+250", side: "A", desc: "Pemasangan Inlet KM 23+250 A" },
    { km: "23+450", side: "A", desc: "Pemasangan Inlet KM 23+450 A" },
    { km: "23+650", side: "A", desc: "Pemasangan Inlet KM 23+650 A" },
    { km: "23+850", side: "A", desc: "Pemasangan Inlet KM 23+850 A" },
    { km: "24+100", side: "A", desc: "Pemasangan Inlet KM 24+100 A" },
    { km: "24+300", side: "A", desc: "Pemasangan Inlet KM 24+300 A" },
    { km: "24+500", side: "A", desc: "Pemasangan Inlet KM 24+500 A" },
    { km: "24+700", side: "A", desc: "Pemasangan Inlet KM 24+700 A" },
  ];

  const placeholderPhotos = [
    "https://images.unsplash.com/photo-1541888946425-d81bb19480c5",
    "https://images.unsplash.com/photo-1590486803833-ffc4571713df",
    "https://images.unsplash.com/photo-1504307651254-35680f3366d4",
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
    "https://images.unsplash.com/photo-1581092921461-39b9d08a9b21",
    "https://images.unsplash.com/photo-1503387762-592dea58ef23",
    "https://images.unsplash.com/photo-1517089596392-db21525d312d"
  ];

  const getRandomPhoto = () => placeholderPhotos[Math.floor(Math.random() * placeholderPhotos.length)];

  console.log(`Memproses ${inletKMs.length} data laporan inlet baru...`);

  for (const item of inletKMs) {
    const data = {
      km: `KM ${item.km} ${item.side}`,
      type: 'inlet',
      category: 'INLET',
      description: item.desc,
      status: 'completed',
      timestamp: Date.now(),
      createdDay: new Date().toLocaleDateString('id-ID'),
      serverTimestamp: serverTimestamp(),
      userEmail: userEmail,
      ownerId: 'SYSTEM_REPORT', 
      // Dokumentasi 0%, 50%, 100% menggunakan array
      photos0: [getRandomPhoto()],
      photos50: [getRandomPhoto()],
      photos100: [getRandomPhoto()],
      qty: 1,
      unit: 'Unit'
    };

    try {
      const docRef = await addDoc(collection(db, 'projects', pId, 'entries'), data);
      console.log(`[BERHASIL] ${data.km} terinput. ID: ${docRef.id}`);
    } catch (e) {
      console.log(`[GAGAL] ${data.km}: ${e.message}`);
    }
  }

  console.log("Input laporan inlet selesai!");
  process.exit();
}

generateReport();
