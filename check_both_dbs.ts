import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const dbShaka = getFirestore(app, "shaka-prod-v3");
  const dbBlaze = getFirestore(app, "blaze-db");

  try {
    const snap = await getDocs(collection(dbShaka, 'inlet_reports'));
    console.log(`shaka-prod-v3 has ${snap.size} inlet_reports`);
  } catch (e: any) {
    console.log("shaka-prod-v3 error:", e.message);
  }

  try {
    const snap2 = await getDocs(collection(dbBlaze, 'inlet_reports'));
    console.log(`blaze-db has ${snap2.size} inlet_reports`);
  } catch (e: any) {
    console.log("blaze-db error:", e.message);
  }
}
run();
