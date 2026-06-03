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
  
  let r2Count = 0;
  snapshot.forEach(d => {
       const kmStr = (d.data().km || '').toUpperCase();
       
       const match = kmStr.match(/(?:(?:KM)\s*)?0*(\d{1,2})\+(\d{1,3})/);
       if (match) {
            const km = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            const isAOS = kmStr.includes('A/OS');
            const isBOS = kmStr.includes('B/OS');
            if (isBOS && kmStr.includes('B/OS')) {
                if ((km === 60 && m >= 200) || (km === 61 && m <= 400)) {
                    r2Count++;
                }
            }
       }
  });
  console.log('Ranting 2 (B/OS 60+200 sd 61+400):', r2Count);
  process.exit(0);
}
run();
