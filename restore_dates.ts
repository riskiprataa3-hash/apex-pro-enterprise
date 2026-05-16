import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, getDoc, query, where, documentId, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);

async function restore() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  
  const destDb = getFirestore(app, 'shaka-v4');
  const srcDb = getFirestore(app, '(default)');

  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const snaps = await getDocs(collection(destDb, 'projects', projectId, 'entries'));
  
  let count = 0;
  // We'll read all from shaka-v4 and check all docs we have locally to find out what original timestamp was
  // Let's first read from (default).
  const srcSnaps = await getDocs(collection(srcDb, 'projects', projectId, 'entries'));
  const srcMap = new Map();
  srcSnaps.forEach(s => srcMap.set(s.id, s.data()));

  for (const destDoc of snaps.docs) {
    const data = destDoc.data();
    if (data.description === 'NON FRAME') {
      const srcData = srcMap.get(destDoc.id);
      if (srcData) {
        if (srcData.timestamp !== data.timestamp) {
          await updateDoc(destDoc.ref, { timestamp: srcData.timestamp });
          count++;
          console.log(`Reverted ${destDoc.id} back to ${new Date(srcData.timestamp).toISOString()}`);
        }
      }
    }
  }
  
  // What about shaka-prod-v3?
  const prodDb = getFirestore(app, 'shaka-prod-v3');
  const prodSnaps = await getDocs(collection(prodDb, 'projects', projectId, 'entries'));
  const prodMap = new Map();
  prodSnaps.forEach(s => prodMap.set(s.id, s.data()));
  for (const destDoc of snaps.docs) {
    const data = destDoc.data();
    if (data.description === 'NON FRAME') {
      const prodData = prodMap.get(destDoc.id);
      if (prodData) {
        if (prodData.timestamp !== data.timestamp) {
           // update from prod if not already updated from default
           const currentData = (await getDoc(destDoc.ref)).data()!;
           if (currentData.timestamp === data.timestamp) {
               await updateDoc(destDoc.ref, { timestamp: prodData.timestamp });
               count++;
               console.log(`Reverted ${destDoc.id} from prod back to ${new Date(prodData.timestamp).toISOString()}`);
           }
        }
      }
    }
  }

  console.log(`Restored timestamp for ${count} NON FRAME entries.`);
  process.exit(0);
}
restore().catch(console.error);
