import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app, "shaka-prod-v3");
  const projectId = "TbtZli8c6XY3AGtWjls5";
  
  const q = query(collection(db, 'inlet_reports'), where('projectId', '==', projectId));
  const snap = await getDocs(q);
  console.log(`Total records for project ${projectId} in shaka-prod-v3: ${snap.size}`);
  
  // Search for 17+600
  const q2 = query(collection(db, 'inlet_reports'), where('lokasi_km', '==', '17+600 A'));
  const snap2 = await getDocs(q2);
  console.log(`Records for 17+600 A: ${snap2.size}`);

  const q3 = query(collection(db, 'inlet_reports'), where('km', '==', '17+600 A'));
  const snap3 = await getDocs(q3);
  console.log(`Records for 17+600 A (field 'km'): ${snap3.size}`);
}
run();
