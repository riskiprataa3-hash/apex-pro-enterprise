import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app, "shaka-prod-v3");
  const snap = await getDocs(collection(db, 'projects'));
  console.log(`Projects found: ${snap.size}`);
  snap.forEach(d => {
    console.log(`- ID: ${d.id}, Name: ${d.data().name || d.data().title}`);
  });
}
run();
