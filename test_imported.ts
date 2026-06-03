import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getRantingClass } from './src/utils/ranting';

async function run() {
  const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(JSONconfig);
  const auth = getAuth(app);
  const db = getFirestore(app, 'shaka-v4');
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  
  const snapshot = await getDocs(collection(db, 'projects', 'TbtZli8c6XY3AGtWjls5', 'entries'));
  
  let stats: Record<string, number> = {};
  snapshot.forEach(d => {
       const kmStr = d.data().km;
       const cl = getRantingClass(kmStr);
       stats[cl] = (stats[cl] || 0) + 1;
  });
  console.log(stats);
  process.exit(0);
}
run();
