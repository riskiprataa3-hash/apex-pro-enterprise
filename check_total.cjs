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
  const rawSnap = await getDocs(collection(db, 'inlet_reports'));
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const snapshot = await getDocs(collection(db, 'projects', projectId, 'entries'));
  console.log('Total inlet_reports:', rawSnap.size);
  console.log('Total entries:', snapshot.size);

  let manual = 0;
  snapshot.forEach(d => {
       if (d.data().isManual) manual++;
  });
  console.log('Total manual entries:', manual);
  process.exit(0);
}
run();
