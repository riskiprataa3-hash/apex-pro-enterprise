import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function inspect(dbId: string | undefined) {
  const label = dbId || '(default)';
  console.log(`\n=== Inspecting ${label} ===`);
  const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
  
  const collections = ['inlet_reports', 'reports', 'entries', 'projects', 'workers'];
  
  for (const colName of collections) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`Collection [${colName}]: ${snap.size} documents`);
      if (snap.size > 0 && colName === 'inlet_reports') {
         const first = snap.docs[0].data();
         console.log(`  Sample: ID=${snap.docs[0].id}, KM=${first.lokasi_km || first.km || 'N/A'}, ProjectId=${first.projectId || 'N/A'}`);
      }
    } catch (e: any) {
      console.log(`Collection [${colName}]: Error - ${e.message}`);
    }
  }
}

async function run() {
  await inspect('shaka-prod-v3');
  await inspect('blaze-db');
  await inspect(undefined);
}

run();
