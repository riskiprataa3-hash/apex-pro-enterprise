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
       
       const match = kmStr.match(/(?:KM\s*)?0*(\d{1,2})\+(\d{1,3})/);
       if (match) {
            const km = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            
            if (kmStr.includes('A/OS')) {
                if (km === 8 && m >= 800) found.push(kmStr);
                else if (km === 9 && m <= 300) found.push(kmStr);
                
                else if (km === 54 && m >= 980) found.push(kmStr);
                else if (km === 55 && m <= 600) found.push(kmStr);
            }
            if (kmStr.includes('B/OS')) {
                if ((km === 60 && m >= 200) || (km === 61 && m <= 400)) found.push(kmStr);
            }
       }
  });
  console.log(found.sort());
  process.exit(0);
}
run();
