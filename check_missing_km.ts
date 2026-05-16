import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app, "shaka-prod-v3");
  const projectId = "TbtZli8c6XY3AGtWjls5";
  const ref = collection(db, 'projects', projectId, 'entries');
  
  const snap = await getDocs(ref);
  console.log(`Total entries in projects/${projectId}/entries: ${snap.size}`);
  
  snap.forEach(d => {
    const data = d.data();
    if (JSON.stringify(data).includes("17+600")) {
      console.log(`FOUND 17+600 in entry ${d.id}:`);
      console.log(`  Data: ${JSON.stringify(data)}`);
    }
  });
}
run();
