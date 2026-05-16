import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function check(id: string | undefined) {
  const label = id || 'default';
  try {
    const db = id ? getFirestore(app, id) : getFirestore(app);
    const snap = await getDocs(collection(db, 'inlet_reports'));
    console.log(`${label}: ${snap.size} inlet_reports`);
    if (snap.size > 0) {
       console.log(`  Sample from ${label}: KM=${snap.docs[0].data().lokasi_km || snap.docs[0].data().km}`);
    }
  } catch (e: any) {
    console.log(`${label}: Error - ${e.message}`);
  }
}

async function run() {
  await check(undefined);
  await check('blaze-db');
  await check('shaka-prod-v3');
}
run();
