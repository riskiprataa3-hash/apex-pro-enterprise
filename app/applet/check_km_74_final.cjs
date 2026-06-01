const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, collectionGroup } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-v4");

async function run() {
  const c = collectionGroup(db, 'entries');
  const d = await getDocs(c);
  let count = 0;
  let items = [];
  d.forEach(doc => {
    const data = doc.data();
    if (String(data.km).trim() === '74') {
      const lajur = String(data.lajur || '').trim().toUpperCase();
      if (lajur === 'B/OS' || lajur === 'B / OS' || lajur === 'B OS') {
        count++;
        items.push({ id: doc.id, ...data });
      }
    }
  });
  console.log(`Total KM 74 B/OS across all projects: ${count}`);
  if (count > 0) {
    items.forEach(i => console.log(`- ${i.id} | ${i.date || i.timestamp} | KM: ${i.km} | Lajur: ${i.lajur}`));
  }
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
