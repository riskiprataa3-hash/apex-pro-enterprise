const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

async function run() {
  const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(JSONconfig);
  const auth = getAuth(app);
  const db = getFirestore(app, 'shaka-v4');
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  const snapshot = await getDocs(collection(db, 'projects', 'TbtZli8c6XY3AGtWjls5', 'entries'));
  let hasRantingField = false;
  let cnt = 0;
  snapshot.forEach(d => {
       const data = d.data();
       if(data.ranting || data.Ranting || data.projectPart || data.section){
           hasRantingField = true;
           cnt++;
       }
  });
  console.log('Has ranting field:', hasRantingField, cnt);
  process.exit(0);
}
run();
