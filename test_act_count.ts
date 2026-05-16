import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const db = getFirestore(app, 'shaka-v4');

async function check() {
  const q = query(collection(db, 'activities'), limit(100)); // just to see
  const sn = await getDocs(q);
  console.log("Found activities:", sn.size);
  
  const h = query(collection(db, 'attendance'), limit(100));
  const hsn = await getDocs(h);
  console.log("Found attendance:", hsn.size);
}

check().catch(console.error);
