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
  
  let validDates = ['29 Mei 2026', '30 Mei 2026', '31 Mei 2026', '01 Jun 2026'];
  
  let invalidR12 = [];
  snapshot.forEach(d => {
       const data = d.data();
       let kmVal = (data.km || '').toUpperCase().replace(/^KM\s*/, '').trim();
       const dString = data.dateDisplay || data.tanggal || data.createdDay || 'unknown';
       let isR12Date = validDates.includes(dString);

       const kmMatch = kmVal.match(/^0*(\d{1,3})\+/);
       let is12 = false;
       if (kmMatch) {
            const kmNum = parseInt(kmMatch[1], 10);
            if (kmNum > 24) is12 = true;
       } else if (kmVal.includes('ON-RAMP') || kmVal.includes('OFF-RAMP') || kmVal.includes('ON RAMP')) {
            if (!(kmVal.match(/0\+\d{3}/) || kmVal.match(/00\+\d{3}/))) is12 = true;
       }
       if (is12 && !isR12Date) invalidR12.push({id: d.id, km: kmVal, date: dString});
  });
  
  console.log('Invalid R12 (Wrong Date):', invalidR12);
  
  if (invalidR12.length === 1) {
       console.log('Deleting extra item!!!');
       await deleteDoc(doc(db, 'projects', projectId, 'entries', invalidR12[0].id));
  }
  process.exit(0);
}
run();
