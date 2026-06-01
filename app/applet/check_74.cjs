const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

const fs = require('fs');
const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, "shaka-v4");

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  const c = collectionGroup(db, 'entries');
  const d = await getDocs(c);
  let count = 0;
  
  d.forEach(doc => {
    const data = doc.data();
    // km string contains "74" and "B"
    const kmText = String(data.km).toUpperCase();
    const lajurText = String(data.lajur).toUpperCase();
    
    // checks: 
    // 1) begins with 74 or "KM 74"
    if ((kmText.includes('74+') || kmText.startsWith('74') || kmText.includes('KM 74') || kmText === '74') && 
        (kmText.includes('B') || lajurText.includes('B'))) {
        // Exclude if it's actually 12+740 B
        if (!kmText.match(/^\d{2}\+740/)) {
           // wait, just check if it starts with 74 
           let stripped = kmText.replace(/KM/g, '').trim();
           if (stripped.startsWith('74+') || stripped.startsWith('74') || stripped === '74') {
             if (stripped.includes('B') || lajurText.includes('B')) {
                 count++;
             }
           }
        }
    }
  });
  console.log(`\n=== Total KM 74 B/OS (including 74+xxx B): ${count} ===\n`);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
