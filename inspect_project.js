import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const db = getFirestore(app, 'shaka-v4');
const auth = getAuth(app);

async function extract() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  
  const p = await getDoc(doc(db, 'projects', 'TbtZli8c6XY3AGtWjls5'));
  console.log(p.data());
  process.exit(0);
}
extract().catch((e) => { console.error(e); process.exit(1); });
