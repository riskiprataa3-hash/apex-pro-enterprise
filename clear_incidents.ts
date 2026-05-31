import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc } from 'firebase/firestore';
import * as fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clearData() {
  const incRef = collection(db, 'incidents');
  const snapshotInc = await getDocs(incRef);
  let countInc = 0;
  for (const docSnap of snapshotInc.docs) {
    await deleteDoc(docSnap.ref);
    countInc++;
  }
  console.log(`Deleted ${countInc} incidents successfully`);
  
  const hseRef = collection(db, 'hse_logs');
  const snapshotHse = await getDocs(hseRef);
  let countHse = 0;
  for (const docSnap of snapshotHse.docs) {
      await deleteDoc(docSnap.ref);
      countHse++;
  }
  console.log(`Deleted ${countHse} HSE logs successfully`);
}

clearData().then(() => process.exit(0)).catch(console.error);
