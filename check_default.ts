import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app);
  console.log("Checking (default) database...");
  const cols = ['inlet_reports', 'marka_reports', 'reports', 'entries', 'projects'];
  for (const c of cols) {
    try {
      const snap = await getDocs(collection(db, c));
      console.log(`${c}: ${snap.size} docs`);
    } catch (e) {}
  }
}
run();
