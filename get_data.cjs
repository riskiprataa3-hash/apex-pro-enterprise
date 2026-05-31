const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, query, where, addDoc } = require("firebase/firestore");
const fs = require("fs");

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const projs = await getDocs(collection(db, 'projects'));
  for (const p of projs.docs) {
    const data = p.data();
    if (data.type !== 'inlet') continue; // assuming they might be referring to inlet as it usually has many entries
    console.log(`\nProject: ${p.id} - ${data.name} - ${data.type}`);
    const entries = await getDocs(collection(db, 'projects', p.id, 'entries'));
    
    let grouped = {};
    for (const e of entries.docs) {
      if (e.data().isArchived) continue;
      const t = e.data().timestamp;
      if (!t) continue;
      const d = new Date(t);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    }
    console.log(grouped);
  }
}
run().catch(console.error);
