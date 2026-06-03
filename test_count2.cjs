const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

function getRantingClass(kmVal) {
    const kmStr = (kmVal || '').toUpperCase();
    if (!kmStr) return 'Unknown';

    if (kmStr.includes('KANDIS SELATAN')) return 'Ranting 1';

    const match = kmStr.match(/(?:KM\s*)?0*(\d{1,2})\+(\d{1,3})/);
    if (match) {
        const km = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const isAOS = kmStr.includes('A/OS');
        const isBOS = kmStr.includes('B/OS');
        
        // Ranting 2 rules
        if (isBOS) {
            if (km === 74 && (m >= 800 && m <= 899)) return 'Ranting 2';
            if ((km === 60 && m >= 200) || (km === 61 && m <= 400)) return 'Ranting 2';
            if (km === 55 && m === 610) return 'Ranting 2';
            if (km === 55 && m === 150) return 'Ranting 2';
            if (km === 44 && m >= 0 && m <= 400) return 'Ranting 2';
        }
        if (isAOS) {
            if (km === 44 && m >= 0 && m <= 400) return 'Ranting 2';
            if ((km === 54 && m >= 980) || (km === 55 && m <= 600)) return 'Ranting 2';
            if ((km === 60 && m >= 300) || (km === 61 && m <= 400)) return 'Ranting 2';
            if ((km === 74 && m >= 400) || (km === 75 && m === 0)) return 'Ranting 2';
        }
        
        // Ranting 1 rules
        if (isAOS) {
            if (km === 8 && m === 0) return 'Ranting 1';
            if (km === 8 && m === 600) return 'Ranting 1';
            if ((km === 8 && m >= 800) || (km === 9 && m <= 300)) return 'Ranting 1';
        }
        if (isBOS) {
            if (km === 12 && m === 200) return 'Ranting 1';
            if (km === 8 && m === 0) return 'Ranting 1';
        }
    }
    
    return 'Ranting 3';
}

async function run() {
  const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(JSONconfig);
  const auth = getAuth(app);
  const db = getFirestore(app, 'shaka-v4');
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  
  const snapshot = await getDocs(collection(db, 'projects', 'TbtZli8c6XY3AGtWjls5', 'entries'));
  
  let stats = {};
  snapshot.forEach(d => {
       const kmStr = d.data().km;
       const cl = getRantingClass(kmStr);
       stats[cl] = (stats[cl] || 0) + 1;
  });
  console.log(stats);
  process.exit(0);
}
run();
