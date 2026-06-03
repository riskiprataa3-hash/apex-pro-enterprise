const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const snapshot = await getDocs(collection(db, 'projects', projectId, 'entries'));
  
  let ranting3Count = 0;
  let ranting12Count = 0;
  let unknownCount = 0;

  let kms = {};

  snapshot.forEach(d => {
       const data = d.data();
       const kmVal = data.km || '';
       kms[kmVal] = (kms[kmVal] || 0) + 1;
       
       let entryRanting = '';
       const kmMatch = kmVal.match(/^\s*0*(\d{1,3})\+/);
       if (kmMatch) {
            const kmNum = parseInt(kmMatch[1], 10);
            if (kmNum >= 0 && kmNum <= 24) {
               entryRanting = 'Ranting 3';
            } else {
               entryRanting = 'Ranting 1 & 2';
            }
       } else if (kmVal.toUpperCase().includes('ON-RAMP') || kmVal.toUpperCase().includes('OFF-RAMP')) {
            if (kmVal.match(/0\+\d{3}/) || kmVal.match(/00\+\d{3}/)) {
                entryRanting = 'Ranting 3';
            } else {
                entryRanting = 'Ranting 1 & 2';
            }
       } else {
            entryRanting = 'Unknown';
       }
       
       if (entryRanting === 'Ranting 3') ranting3Count++;
       else if (entryRanting === 'Ranting 1 & 2') ranting12Count++;
       else unknownCount++;
  });
  
  console.log('Ranting 1 & 2:', ranting12Count);
  console.log('Ranting 3:', ranting3Count);
  console.log('Unknown/Unclassified:', unknownCount);
  console.log('Total entries:', snapshot.size);
  process.exit(0);
}
run();
