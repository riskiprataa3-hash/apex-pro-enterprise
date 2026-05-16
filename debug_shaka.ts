import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app, "shaka-prod-v3");
  console.log("Checking inlet_reports in shaka-prod-v3...");
  
  try {
    const snap = await getDocs(collection(db, 'inlet_reports'));
    console.log(`Total inlet_reports: ${snap.size}`);
    
    // Check for KM 17+600 A
    const q = query(collection(db, 'inlet_reports'), where('lokasi_km', '==', '17+600 A'));
    const snap2 = await getDocs(q);
    console.log(`Docs with KM 17+600 A: ${snap2.size}`);
    
    if (snap2.empty) {
       console.log("Searching alternatives for 17+600...");
       const all = await getDocs(collection(db, 'inlet_reports'));
       all.docs.slice(0, 10).forEach(d => console.log(`  - ${d.id}: KM=${d.data().lokasi_km || d.data().km}`));
    } else {
       console.log("Found 17+600 A data:", JSON.stringify(snap2.docs[0].data(), null, 2));
    }

    // Check project TbtZli8c6XY3AGtWjls5
    const qProj = query(collection(db, 'inlet_reports'), where('projectId', '==', 'TbtZli8c6XY3AGtWjls5'));
    const snapProj = await getDocs(qProj);
    console.log(`Docs for project TbtZli8c6XY3AGtWjls5: ${snapProj.size}`);

  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

run();
