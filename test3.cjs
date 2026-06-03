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
  
  let statsAll = {};
  let statsFilter = {};

  snapshot.forEach(d => {
       const data = d.data();
       let kmVal = (data.km || '').toUpperCase().replace(/^KM\s*/, '').trim();
       const dString = data.dateDisplay || data.tanggal || data.createdDay || 'unknown';
       let isR12Date = validDates.includes(dString);

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
       
       if (entryRanting === 'Ranting 1 & 2') {
           if (isR12Date) {
               statsFilter['Ranting 1 & 2 Valid Date'] = (statsFilter['Ranting 1 & 2 Valid Date'] || 0) + 1;
           } else {
               statsFilter['Ranting 1 & 2 Invalid Date'] = (statsFilter['Ranting 1 & 2 Invalid Date'] || 0) + 1;
           }
       }
       
       if (entryRanting === 'Ranting 3') {
           if (!isR12Date) {
               statsFilter['Ranting 3 Valid Date'] = (statsFilter['Ranting 3 Valid Date'] || 0) + 1;
           } else {
               statsFilter['Ranting 3 Invalid Date'] = (statsFilter['Ranting 3 Invalid Date'] || 0) + 1;
           }
       }
  });
  
  console.log('All:', statsAll);
  console.log('Date Filtered:', statsFilter);
  process.exit(0);
}
run();
