import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app, "shaka-prod-v3");
  const snap = await getDocs(collection(db, 'entries'));
  console.log(`Entries: ${snap.size}`);
  if (snap.size > 0) {
    console.log("Sample Entry:", JSON.stringify(snap.docs[0].data(), null, 2));
  }
}
run();
