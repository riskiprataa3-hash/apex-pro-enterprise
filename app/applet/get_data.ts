import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, query, where } from "firebase/firestore";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const projs = await getDocs(collection(db, 'projects'));
  for (const p of projs.docs) {
    const data = p.data();
    console.log(`Project: ${p.id} - ${data.name} - ${data.type}`);
    const entries = await getDocs(collection(db, 'projects', p.id, 'entries'));
    
    let grouped: Record<string, number> = {};
    for (const e of entries.docs) {
      // 13 May means d.getDate() == 13
      const d = new Date(e.data().timestamp);
      // to avoid timezone issues:
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    }
    console.log(grouped);
  }
}
run().catch(console.error);
