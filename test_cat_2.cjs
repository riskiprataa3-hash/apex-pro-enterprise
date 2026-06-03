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
  
  let cat = {
      'R1 A/OS 08+000': 0,
      'R1 A/OS 08+600': 0,
      'R1 A/OS 08+800 sd 9+300': 0,
      'R1 A/OS KANDIS SELATAN': 0,
      'R1 B/OS 12+200': 0,
      'R1 B/OS 08+000': 0,
      'R2 B/OS 74+800': 0,
      'R2 B/OS 61+400 sd 60+200': 0,
      'R2 B/OS 55+610': 0,
      'R2 B/OS 55+150': 0,
      'R2 B/OS 44+400 sd 44+000': 0,
      'R2 A/OS 44+000 sd 44+400': 0,
      'R2 A/OS 54+980 sd 55+600': 0,
      'R2 A/OS 60+300 sd 61+400': 0,
      'R2 A/OS 74+400 sd 75+000': 0,
  };

  snapshot.forEach(d => {
       const kmStr = (d.data().km || '').toUpperCase();
       
       if (kmStr.includes('KANDIS SELATAN')) {
           cat['R1 A/OS KANDIS SELATAN']++;
           return;
       }
       
       const match = kmStr.match(/(?:KM\s*)?0*(\d{1,2})\+(\d{1,3})/);
       if (match) {
            const km = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            const isAOS = kmStr.includes('A/OS');
            const isBOS = kmStr.includes('B/OS');
            
            if (isAOS) {
                if (km === 8 && m === 0) cat['R1 A/OS 08+000']++;
                else if (km === 8 && m === 600) cat['R1 A/OS 08+600']++;
                else if ((km === 8 && m >= 800) || (km === 9 && m <= 300)) cat['R1 A/OS 08+800 sd 9+300']++; // Note: what if it matches km 8 but smaller than 800? 
                
                else if (km === 44 && m >= 0 && m <= 400) cat['R2 A/OS 44+000 sd 44+400']++;
                else if ((km === 54 && m >= 980) || (km === 55 && m <= 600)) cat['R2 A/OS 54+980 sd 55+600']++;
                else if ((km === 60 && m >= 300) || (km === 61 && m <= 400)) cat['R2 A/OS 60+300 sd 61+400']++;
                else if ((km === 74 && m >= 400) || (km === 75 && m === 0)) cat['R2 A/OS 74+400 sd 75+000']++;
            }
            if (isBOS) {
                if (km === 12 && m === 200) cat['R1 B/OS 12+200']++;
                else if (km === 8 && m === 0) cat['R1 B/OS 08+000']++;
                
                else if (km === 74 && m >= 800 && m <= 899) cat['R2 B/OS 74+800']++;
                else if ((km === 60 && m >= 200) || (km === 61 && m <= 400)) cat['R2 B/OS 61+400 sd 60+200']++;
                else if (km === 55 && m === 610) cat['R2 B/OS 55+610']++;
                else if (km === 55 && m === 150) cat['R2 B/OS 55+150']++;
                else if (km === 44 && m >= 0 && m <= 400) cat['R2 B/OS 44+400 sd 44+000']++;
            }
       }
  });
  console.log(cat);
  process.exit(0);
}
run();
