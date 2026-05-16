import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync, writeFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);

async function restore() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  
  const destDb = getFirestore(app, 'shaka-v4');
  const prodDb = getFirestore(app, 'shaka-prod-v3');
  const defaultDb = getFirestore(app, '(default)');
  const blazeDb = getFirestore(app, 'blaze-db'); // we had a test blaze-db

  const projectId = 'TbtZli8c6XY3AGtWjls5'; // PEKANBARU-DUMAI
  const destSnaps = await getDocs(collection(destDb, 'projects', projectId, 'entries'));
  
  let count = 0;
  for (const srcDb of [prodDb, defaultDb, blazeDb]) {
    try {
      const srcSnaps = await getDocs(collection(srcDb, 'projects', projectId, 'entries'));
      const srcMap = new Map();
      srcSnaps.forEach(s => srcMap.set(s.id, s.data()));

      for (const destDoc of destSnaps.docs) {
        const data = destDoc.data();
        const srcData = srcMap.get(destDoc.id);
        if (srcData && srcData.timestamp !== data.timestamp) {
          // If the destination says the day is 13th, but source was 10th or 11th...
          // or basically ANY timestamp difference for NON FRAME
          if (data.description === 'NON FRAME' && srcData.timestamp < data.timestamp) {
            await updateDoc(destDoc.ref, { timestamp: srcData.timestamp });
            count++;
            console.log(`Reverted ${destDoc.id} back to ${new Date(srcData.timestamp).toISOString()} from one of the DBs`);
            // Update in our array to avoid reverting twice
            Object.assign(data, { timestamp: srcData.timestamp });
          }
        }
      }
    } catch(e) {}
  }
  
  console.log(`Restored timestamp for ${count} NON FRAME entries.`);
  process.exit(0);
}
restore().catch(console.error);
