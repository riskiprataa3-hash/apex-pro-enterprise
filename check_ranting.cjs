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
  const snapshot = await getDocs(collection(db, 'projects'));
  snapshot.forEach(d => {
       console.log(d.id, d.data().name);
  });
  console.log('inlet_reports:');
  const sn2 = await getDocs(collection(db, 'inlet_reports'));
  let inlt = {};
  sn2.forEach(d => {
      let r = d.data().ranting || 'none';
      inlt[r] = (inlt[r] || 0) + 1;
  });
  console.log(inlt);
  process.exit(0);
}
run();
