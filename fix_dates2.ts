import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function fixDates() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  const snaps = await getDocs(collection(db, 'projects', 'TbtZli8c6XY3AGtWjls5', 'entries'));
  
  let count = 0;
  for (const doc of snaps.docs) {
     const data = doc.data();
     if (data.description === 'NON FRAME') {
       // user wants it to be 13th. 13th May 2026 08:00 WIB is 13th May 01:00 UTC
       const t = new Date('2026-05-13T01:00:00Z').getTime() + (count * 60000); // 1 minute apart
       await updateDoc(doc.ref, { timestamp: t });
       count++;
     }
  }
  console.log(`Fixed ${count} dates.`);
  process.exit(0);
}

fixDates().catch(console.error);
