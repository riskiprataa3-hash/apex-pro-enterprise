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
  
  let r12 = [];
  snapshot.forEach(d => {
       let kmVal = (d.data().km || '').toUpperCase().replace(/^KM\s*/, '').trim();
       const kmMatch = kmVal.match(/^0*(\d{1,3})\+/);
       let is12 = false;
       if (kmMatch) {
            const kmNum = parseInt(kmMatch[1], 10);
            if (kmNum > 24) is12 = true;
       } else if (kmVal.includes('ON-RAMP') || kmVal.includes('OFF-RAMP') || kmVal.includes('ON RAMP')) {
            if (!(kmVal.match(/0\+\d{3}/) || kmVal.match(/00\+\d{3}/))) is12 = true;
       }
       if (is12) r12.push({id: d.id, km: kmVal, data: d.data()});
  });
  
  let kms = {};
  let dups = [];
  r12.forEach((e) => {
      if (kms[e.km]) dups.push(e);
      kms[e.km] = true;
  });
  
  console.log('Duplicates in R12:', dups.length);
  if (dups.length > 0) {
      console.log('Deleting duplicate:', dups[0].km);
      await deleteDoc(doc(db, 'projects', projectId, 'entries', dups[0].id));
  }
  
  process.exit(0);
}
run();
