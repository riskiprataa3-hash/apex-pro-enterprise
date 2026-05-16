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
  let map: Record<number, number> = {};
  snaps.forEach(s => {
    const d = s.data();
    const dt = new Date(d.timestamp);
    const dateStr = dt.getDate();
    map[dateStr] = (map[dateStr] || 0) + 1;
  });
  console.log('shaka-v4 Date distribution:', map);

  const srcSnaps = await getDocs(collection(srcDb, 'projects', projectId, 'entries'));
  let srcMap: Record<number, number> = {};
  srcSnaps.forEach(s => {
    const d = s.data();
    const dt = new Date(d.timestamp);
    const dateStr = dt.getDate();
    srcMap[dateStr] = (srcMap[dateStr] || 0) + 1;
  });
  console.log('shaka-prod-v3 Date distribution:', srcMap);
  
  process.exit(0);
}
c();
