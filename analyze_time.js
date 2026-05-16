import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function analyzeTimestamps() {
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const entriesRef = collection(db, 'projects', projectId, 'entries');
  const snap = await getDocs(entriesRef);
  
  const entries = snap.docs.map(d => d.data());
  entries.sort((a, b) => a.timestamp - b.timestamp);
  
  console.log(`Total Entries: ${entries.length}`);
  
  const clusters = {};
  entries.forEach(e => {
    const d = new Date(e.timestamp);
    const dateStr = d.toLocaleDateString('id-ID');
    const hour = d.getHours();
    const key = `${dateStr} ${hour}:00`;
    clusters[key] = (clusters[key] || 0) + 1;
  });
  
  console.log("\nDistribution by Hour (Local Time):");
  Object.keys(clusters).sort().forEach(k => {
    console.log(`${k} -> ${clusters[k]} entries`);
  });

  process.exit();
}

analyzeTimestamps();
