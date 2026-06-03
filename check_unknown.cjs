const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const snapshot = await getDocs(collection(db, 'projects', projectId, 'entries'));
  
  let sampleUnknowns = [];
  snapshot.forEach(d => {
       const data = d.data();
       const dString = data.dateDisplay || data.tanggal || data.createdDay || 'unknown';
       if (dString === 'unknown' && sampleUnknowns.length < 5) {
           sampleUnknowns.push(data);
       }
  });
  
  console.dir(sampleUnknowns);
  process.exit(0);
}
run();
