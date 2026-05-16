import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  try {
    const docRef = doc(db, 'test', 'quota_check');
    const d = await getDoc(docRef);
    console.log('Successfully read test doc from shaka-v4.', d.exists());
  } catch(e: any) {
    console.error('Failed to read:', e.message);
  }
  process.exit(0);
}
run();
