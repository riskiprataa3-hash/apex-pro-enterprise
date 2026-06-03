const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const snapshot = await getDocs(collection(db, 'projects', projectId, 'entries'));
  
  let unks = [];
  snapshot.forEach(d => {
       let kmVal = (d.data().km || '').toUpperCase().replace(/^KM\s*/, '').trim();
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
       if (entryRanting === 'Unknown') {
           unks.push({id: d.id, km: kmVal, data: d.data()});
       }
  });
  console.log('Unknowns:', unks);
  
  process.exit(0);
}
run();
