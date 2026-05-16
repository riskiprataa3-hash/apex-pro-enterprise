import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');
const srcDb = getFirestore(app, 'shaka-prod-v3');

async function deleteExtra() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  
  const snaps = await getDocs(collection(db, 'projects', projectId, 'entries'));
  const srcSnaps = await getDocs(collection(srcDb, 'projects', projectId, 'entries'));

  let srcIds = new Set();
  srcSnaps.forEach(s => srcIds.add(s.id));

  let count = 0;
  for (const s of snaps.docs) {
    if (!srcIds.has(s.id)) {
      await deleteDoc(s.ref);
      count++;
    }
  }

  console.log(`Deleted ${count} extra documents from shaka-v4 that were not in shaka-prod-v3.`);
  process.exit(0);
}
deleteExtra().catch(console.error);
