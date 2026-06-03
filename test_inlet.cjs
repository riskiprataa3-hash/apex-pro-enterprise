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
  const snapshot = await getDocs(collection(db, 'inlet_reports'));
  let statsAll = {};
  snapshot.forEach(d => {
       const data = d.data();
       let kmVal = (data.lokasi_km || '').toUpperCase().replace(/^KM\s*/, '').trim();
       let entryRanting = '';
       const kmMatch = kmVal.match(/^0*(\d{1,3})\+/);
       if (kmMatch) {
            const kmNum = parseInt(kmMatch[1], 10);
            if (kmNum >= 0 && kmNum <= 24) {
               entryRanting = 'Ranting 3';
            } else {
               entryRanting = 'Ranting 1 & 2';
            }
       } else if (kmVal.includes('ON-RAMP') || kmVal.includes('OFF-RAMP') || kmVal.includes('ON RAMP')) {
            if (kmVal.match(/0\+\d{3}/) || kmVal.match(/00\+\d{3}/)) {
                entryRanting = 'Ranting 3';
            } else {
                entryRanting = 'Ranting 1 & 2';
            }
       } else {
            entryRanting = 'Unknown';
       }
       statsAll[entryRanting] = (statsAll[entryRanting] || 0) + 1;
  });
  console.log('inlet_reports summary:', statsAll);
  process.exit(0);
}
run();
