const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = require('./firebase-applet-config.json');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const c = collection(db, 'entries');
  const d = await getDocs(c);
  let count = 0;
  let items = [];
  d.forEach(doc => {
    const data = doc.data();
    if (String(data.km) === '74' && (String(data.lajur).toUpperCase() === 'B/OS' || String(data.lajur).toUpperCase() === 'B / OS' || String(data.lajur).toUpperCase() === 'B OS')) {
      count++;
      items.push({ id: doc.id, ...data });
    }
  });
  console.log('Total KM 74 B/OS:', count);
  items.forEach(i => console.log(`- ${i.id} | ${i.date} | ${i.km} | ${i.lajur}`));
  process.exit(0);
}
run();
