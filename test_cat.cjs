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
      'Ranting 1 - A/OS 08+000': 0,
      'Ranting 1 - A/OS 08+600': 0,
      'Ranting 1 - A/OS 08+800 sd 9+300': 0,
      'Ranting 1 - Akses keluar kandis selatan': 0,
      
      'Ranting 1 - B/OS 12+200': 0,
      'Ranting 1 - B/OS 08+000': 0,
      
      'Ranting 2 - B/OS 74+800': 0,
      'Ranting 2 - B/OS 60+200 sd 61+400': 0,
      'Ranting 2 - B/OS 55+610': 0,
      'Ranting 2 - B/OS 55+150': 0,
      'Ranting 2 - B/OS 44+000 sd 44+400': 0,
      
      'Ranting 2 - A/OS 44+000 sd 44+400': 0,
      'Ranting 2 - A/OS 54+980 sd 55+600': 0,
      'Ranting 2 - A/OS 60+300 sd 61+400': 0,
      'Ranting 2 - A/OS 74+400 sd 75+000': 0,
  };

  snapshot.forEach(d => {
       const kmStr = (d.data().km || '').toUpperCase();
       
       if (kmStr.includes('KANDIS SELATAN')) cat['Ranting 1 - Akses keluar kandis selatan']++;
       
       const match = kmStr.match(/(?:(?:KM)\s*)?0*(\d{1,2})\+(\d{1,3})/);
       if (match) {
            const km = parseInt(match[1], 10);
            const m = parseInt(match[2], 10);
            const isAOS = kmStr.includes('A/OS');
            const isBOS = kmStr.includes('B/OS');
            
            if (isAOS) {
                if (km === 8 && m === 0) cat['Ranting 1 - A/OS 08+000']++;
                if (km === 8 && m === 600) cat['Ranting 1 - A/OS 08+600']++;
                if ((km === 8 && m >= 800) || (km === 9 && m <= 300)) cat['Ranting 1 - A/OS 08+800 sd 9+300']++;
                
                if (km === 44 && m >= 0 && m <= 400) cat['Ranting 2 - A/OS 44+000 sd 44+400']++;
                if ((km === 54 && m >= 980) || (km === 55 && m <= 600)) cat['Ranting 2 - A/OS 54+980 sd 55+600']++;
                if ((km === 60 && m >= 300) || (km === 61 && m <= 400)) cat['Ranting 2 - A/OS 60+300 sd 61+400']++;
                if ((km === 74 && m >= 400) || (km === 75 && m === 0)) cat['Ranting 2 - A/OS 74+400 sd 75+000']++;
            }
            if (isBOS) {
                if (km === 12 && m === 200) cat['Ranting 1 - B/OS 12+200']++;
                if (km === 8 && m === 0) cat['Ranting 1 - B/OS 08+000']++;
                
                if (km === 74 && m === 800) cat['Ranting 2 - B/OS 74+800']++;
                if ((km === 60 && m >= 200) || (km === 61 && m <= 400)) cat['Ranting 2 - B/OS 60+200 sd 61+400']++;
                if (km === 55 && m === 610) cat['Ranting 2 - B/OS 55+610']++;
                if (km === 55 && m === 150) cat['Ranting 2 - B/OS 55+150']++;
                if (km === 44 && m >= 0 && m <= 400) cat['Ranting 2 - B/OS 44+000 sd 44+400']++;
            }
       }
  });
  console.log(cat);
  process.exit(0);
}
run();
