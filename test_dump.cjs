const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

async function run() {
  const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(JSONconfig);
  const auth = getAuth(app);
  const db = getFirestore(app, 'shaka-v4');
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  
  const snapshot = await getDocs(collection(db, 'projects', 'TbtZli8c6XY3AGtWjls5', 'entries'));
  
  let found = [];
  snapshot.forEach(d => {
       const kmStr = (d.data().km || '').toUpperCase();
       
       if (kmStr.includes('KANDIS SELATAN')) found.push(kmStr);
       else if (kmStr.includes('08+') || kmStr.includes('09+')) found.push(kmStr);
       else if (kmStr.includes('60+') || kmStr.includes('61+')) found.push(kmStr);
       else if (kmStr.includes('54+') || kmStr.includes('55+')) found.push(kmStr);
  });
  console.log("DUMP:");
  found.sort().forEach(f => console.log(f));
  process.exit(0);
}
run();
