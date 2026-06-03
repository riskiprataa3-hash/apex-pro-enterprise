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
  
  snapshot.forEach(d => {
       const kmStr = (d.data().km || '').toUpperCase();
       
       if (kmStr.includes('KANDIS')) console.log('Found KANDIS:', kmStr);
       
       const match = kmStr.match(/(?:KM\s*)?0*(\d{1,2})\+(\d{1,3})/);
       if (match) {
            const km = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            if (km === 74 && m >= 790 && m <= 810) console.log('Found near 74+800:', kmStr);
       }
  });
  process.exit(0);
}
run();
