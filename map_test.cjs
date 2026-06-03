const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

function getRantingClass(kmVal) {
    const kmStr = (kmVal || '').toUpperCase();
    if (!kmStr) return '';

    if (kmStr.includes('KANDIS SELATAN')) return 'Ranting 1';

    const match = kmStr.match(/(\d{1,3})\+(\d{1,3})/);
    if (match) {
        const km = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const isAOS = kmStr.includes('A/OS');
        const isBOS = kmStr.includes('B/OS');
        const isAIS = kmStr.includes('A/IS');
        const isBIS = kmStr.includes('B/IS');
        
        if (km === 44 || km === 54 || km === 55 || km === 60 || km === 61 || km === 74 || km === 75) {
            return 'Ranting 2';
        }
        
        if (isAOS) {
            if (km === 8 && (m === 0 || m === 600 || (m >= 800))) return 'Ranting 1';
            if (km === 9 && m <= 300) return 'Ranting 1';
        }
        if (isBOS) {
            if (km === 12 && m === 200) return 'Ranting 1';
            if (km === 8 && m === 0) return 'Ranting 1';
        }
    }
    
    return 'Ranting 3';
}

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  const snapshot = await getDocs(collection(db, 'projects', 'TbtZli8c6XY3AGtWjls5', 'entries'));
  
  let stats = {};
  snapshot.forEach(d => {
       const r = getRantingClass(d.data().km);
       stats[r] = (stats[r] || 0) + 1;
  });
  console.log('Resulting mapping:', stats);
  process.exit(0);
}
run();
