const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function check() {
  await signInWithEmailAndPassword(auth, 'pelaksana.shaka@gmail.com', '089519451234');
  const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', 'pemasangan inlet')));
  pDocs.forEach(d => { 
      console.log('Project:', d.id, d.data().name);
  });
  process.exit(0);
}
check();
