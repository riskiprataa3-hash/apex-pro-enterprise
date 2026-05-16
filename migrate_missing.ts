import { readFileSync, writeFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, limit, query, orderBy, documentId, startAfter } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const srcDb = getFirestore(app, 'shaka-prod-v3');
const destDb = getFirestore(app, 'shaka-v4');

async function migrate_missing() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  const cols = ['presensi'];
  
  for (const c of cols) {
    console.log(`Migrating ${c}...`);
    let q = query(collection(srcDb, c), orderBy('timestamp', 'desc'), limit(1500));
    let snap = await getDocs(q);
    console.log(`Found ${snap.size} records in ${c}`);
    let p = snap.docs.map(d => setDoc(doc(destDb, c, d.id), d.data()));
    await Promise.all(p);
    console.log(`Finished ${c}`);
  }
  process.exit();
}

migrate_missing().catch(console.error);
