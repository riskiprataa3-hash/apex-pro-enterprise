const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  
  const rawSnap = await getDocs(collection(db, 'inlet_reports'));
  const validDates = ['29 Mei 2026', '30 Mei 2026', '31 Mei 2026', '01 Jun 2026'];
  const allDates = [];
  for(let i=10; i<=31; i++) allDates.push(`${i < 10 ? '0'+i : i} Mei 2026`);
  for(let i=1; i<=2; i++) allDates.push(`0${i} Jun 2026`);

  let labels = {
      'A/OS': 0, 'A/IS': 0, 'ON-RAMP A/OS': 0,
      'B/OS': 0, 'B/IS': 0, 'OTHER': 0
  };
  
  rawSnap.forEach(d => {
      const data = d.data();
      const date = data.tanggal;
      if (!allDates.includes(date)) return;
      if (validDates.includes(date)) return;
      
      const kmFull = (data.lokasi_km || '').toUpperCase();
      if (!kmFull) return;

      if (kmFull.includes('ON-RAMP') || kmFull.includes('ON RAMP')) labels['ON-RAMP A/OS']++;
      else if (kmFull.includes('A/IS')) labels['A/IS']++;
      else if (kmFull.includes('B/IS')) labels['B/IS']++;
      else if (kmFull.includes('A/OS')) labels['A/OS']++;
      else if (kmFull.includes('B/OS')) labels['B/OS']++;
      else labels['OTHER']++;
  });

  console.log('==================================================');
  console.log('         TOTAL DATA FINAL RANTING 3');
  console.log('==================================================');
  console.log(`A/OS         : ${labels['A/OS']}`);
  console.log(`A/IS         : ${labels['A/IS']}`);
  console.log(`ON-RAMP A/OS : ${labels['ON-RAMP A/OS']}`);
  console.log(`B/OS         : ${labels['B/OS']}`);
  console.log(`B/IS         : ${labels['B/IS']}`);
  console.log('==================================================');

  process.exit(0);
}
run().catch(console.error);
