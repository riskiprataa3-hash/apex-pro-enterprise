import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');
const srcDb = getFirestore(app, 'shaka-prod-v3');

async function c() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  
  const snaps = await getDocs(collection(db, 'projects', projectId, 'entries'));
  const srcSnaps = await getDocs(collection(srcDb, 'projects', projectId, 'entries'));

  let srcIds = new Set();
  srcSnaps.forEach(s => srcIds.add(s.id));

  let inV4NotInV3 = 0;
  snaps.forEach(s => {
    if (!srcIds.has(s.id)) {
      if (inV4NotInV3 === 0) {
        console.log('Sample of extra doc:', s.id, s.data());
      }
      inV4NotInV3++;
    }
  });

  console.log(`shaka-v4 total docs: ${snaps.size}`);
  console.log(`shaka-prod-v3 total docs: ${srcSnaps.size}`);
  console.log(`Docs in v4 but not in v3: ${inV4NotInV3}`);
  
  process.exit(0);
}
c();
