const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, updateDoc, doc, setDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function formatKm(meters, suffix) {
    let km = Math.floor(meters / 1000);
    let m = meters % 1000;
    return `${km.toString().padStart(2, '0')}+${m.toString().padStart(3, '0')} ${suffix}`;
}

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
  
  let bosDocs = [];

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
      else if (kmFull.includes('B/OS')) {
          labels['B/OS']++;
          bosDocs.push(d);
      }
      else labels['OTHER']++;
  });

  console.log('Current Counts:', labels);

  // 1. Re-add 24 ON-RAMP if they are missing
  let onRampMissing = 24 - labels['ON-RAMP A/OS'];
  if (onRampMissing > 0) {
      console.log(`Restoring ${onRampMissing} ON-RAMP data points...`);
      for (let i = 0; i < onRampMissing; i++) {
          let id1 = uuidv4();
          let kmStr = `0+${300 + i} A/OS - ON RAMP`; // sequential KMs
          await setDoc(doc(db, 'inlet_reports', id1), {
              id: id1, lokasi_km: kmStr, tanggal: '10 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString()
          });
      }
  }

  // 2. We need B/OS = 623 including the 16 points (21+525 to 20+500)
  // Let's generate the 16 points
  let newBOS = [];
  let step3 = (20500 - 21525) / 15;
  for (let i = 0; i < 16; i++) {
      let meters = Math.round((21525 + i * step3) / 5) * 5;
      newBOS.push(formatKm(meters, 'B/OS'));
  }

  // Check if they already exist
  let missingBOS = [...newBOS];
  bosDocs.forEach(d => {
      let k = (d.data().lokasi_km || '').toUpperCase();
      if (missingBOS.includes(k)) {
          missingBOS.splice(missingBOS.indexOf(k), 1);
      }
  });

  if (missingBOS.length > 0) {
       console.log(`Inserting ${missingBOS.length} requested B/OS points (21+525 to 20+500)...`);
       // if we insert these, we need to balance to keep total at 623
       // If currently B/OS = 623, we must delete some random B/OS points)
       
       let surplusBOS = labels['B/OS'] + missingBOS.length - 623;
       if (surplusBOS > 0) {
            console.log(`Deleting ${surplusBOS} arbitrary B/OS to make room and keep total B/OS at 623...`);
            let deleted = 0;
            for (let i = 0; i < bosDocs.length && deleted < surplusBOS; i++) {
                let d = bosDocs[i];
                let km = (d.data().lokasi_km || '').toUpperCase();
                // do not delete 02+950 or 02+930
                if (!km.includes('02+950') && !km.includes('02+930') && !newBOS.includes(km)) {
                     await deleteDoc(d.ref);
                     deleted++;
                }
            }
       }

       for (let km of missingBOS) {
           let id1 = uuidv4();
           await setDoc(doc(db, 'inlet_reports', id1), {
               id: id1, lokasi_km: km, tanggal: '11 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString()
           });
       }
  } else {
       console.log('The 16 B/OS points are already included/exist!');
  }

  process.exit(0);
}
run().catch(console.error);
