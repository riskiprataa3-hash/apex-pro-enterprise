import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app, "blaze-db");
  const cols = ['inlet_reports', 'reports', 'entries', 'marka_reports', 'activities'];
  
  for (const c of cols) {
    try {
      const s = await getDocs(collection(db, c));
      console.log(`${c}: ${s.size} docs`);
      if (s.size > 0) {
        console.log(`  Sample: ${JSON.stringify(s.docs[0].data()).substring(0, 100)}`);
      }
    } catch (e: any) {
      // ignore
    }
  }
}
run();
