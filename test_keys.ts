import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  try {
    const keysRef = collection(db, 'access_keys');
    const q = query(keysRef, where('password', '==', '123456'), where('status', '==', 'active'));
    const snap = await getDocs(q);
    console.log('Query success! Docs count:', snap.size);
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
