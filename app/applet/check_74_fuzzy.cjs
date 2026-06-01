const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const fs = require('fs');
const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, "shaka-v4");

async function run() {
  console.log("Logging in...");
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  console.log("Logged in. Querying DB...");
  const c = collectionGroup(db, 'entries');
  const d = await getDocs(c);
  let count = 0;
  let items = [];
  d.forEach(doc => {
    const data = doc.data();
    if (String(data.km).includes('74')) {
        count++;
        items.push({ id: doc.id, ...data });
    }
  });
  console.log(`\nTotal entries with '74' in KM: ${count}\n`);
  if (count > 0) {
    items.forEach(i => console.log(`- ID: ${i.id} | Date: ${i.date || i.createdDay || (i.timestamp ? new Date(i.timestamp).toLocaleString() : '')} | KM: ${i.km} | Lajur: ${i.lajur}`));
  }
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
