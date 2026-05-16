import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app, "shaka-prod-v3");
  console.log("Checking marka_reports in shaka-prod-v3...");
  try {
    const snap = await getDocs(collection(db, 'marka_reports'));
    console.log(`Total marka_reports: ${snap.size}`);
    if (snap.size > 0) {
      console.log("Sample:", JSON.stringify(snap.docs[0].data(), null, 2));
    }
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}
run();
