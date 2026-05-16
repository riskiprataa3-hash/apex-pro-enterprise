import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function check(id) {
  try {
    const db = id ? getFirestore(app, id) : getFirestore(app);
    const snap = await getDocs(collection(db, 'workers'));
    console.log(`${id || 'default'}: ${snap.size} workers`);
  } catch (e) {
    console.log(`${id || 'default'}: FAILED - ${e.message}`);
  }
}

async function start() {
  await check(undefined);
  await check('blaze-db');
  await check('shaka-prod-v3');
}
start();
