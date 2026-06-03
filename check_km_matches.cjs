const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  const snapshot = await getDocs(collection(db, 'projects', 'TbtZli8c6XY3AGtWjls5', 'entries'));
  let kms = new Set();
  snapshot.forEach(d => {
       const km = d.data().km || '';
       if (km.toLowerCase().includes('dumai')) kms.add(km);
       if (km.toLowerCase().includes('ranting')) kms.add(km);
  });
  console.log('Matches:', Array.from(kms));
  process.exit(0);
}
run();
