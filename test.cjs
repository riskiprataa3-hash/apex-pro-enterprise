const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const snapshot = await getDocs(collection(db, 'projects', projectId, 'entries'));
  
  let validDates = ['29 Mei 2026', '30 Mei 2026', '31 Mei 2026', '01 Jun 2026'];
  let r12DatesCount = 0;
  snapshot.forEach(d => {
       const data = d.data();
       const dString = data.dateDisplay || data.tanggal || data.createdDay || 'unknown';
       if (validDates.includes(dString)) {
           r12DatesCount++;
       }
  });
  console.log('Entries with Ranting 1&2 dates:', r12DatesCount);
  
  const rawSnap = await getDocs(collection(db, 'inlet_reports'));
  let rawDateCount = 0;
  rawSnap.forEach(d => {
      const data = d.data();
       const dString = data.tanggal;
       if (validDates.includes(dString)) {
           rawDateCount++;
       }
  });
  console.log('Raw docs with Ranting 1&2 dates:', rawDateCount);
  
  process.exit(0);
}
run();
