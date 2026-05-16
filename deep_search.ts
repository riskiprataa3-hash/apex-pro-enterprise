import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function findValue(dbId, value) {
  const label = dbId || 'default';
  const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
  const cols = ['inlet_reports', 'marka_reports', 'reports', 'entries', 'inlets'];
  
  for (const c of cols) {
    try {
      const snap = await getDocs(collection(db, c));
      for (const d of snap.docs) {
        const data = d.data();
        const str = JSON.stringify(data);
        if (str.includes(value)) {
          console.log(`FOUND "${value}" in ${label}.${c} (ID: ${d.id})`);
          console.log(`  Data: ${str}`);
        }
      }
    } catch (e) {}
  }
}

async function run() {
  const target = "17+600";
  await findValue(undefined, target);
  await findValue('blaze-db', target);
  await findValue('shaka-prod-v3', target);
}
run();
