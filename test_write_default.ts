import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const db = getFirestore(app);

async function run() {
  try {
    await setDoc(doc(db, 'test', 'test'), { hello: 'world' });
    console.log('Successfully wrote to default db');
  } catch(e: any) {
    console.error('Failed to write:', e.message);
  }
  process.exit(0);
}
run();
