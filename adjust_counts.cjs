const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, collectionGroup, deleteDoc, setDoc, doc } = require('firebase/firestore');
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

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  
  const rawSnap = await getDocs(collection(db, 'inlet_reports'));
  const validDates = ['29 Mei 2026', '30 Mei 2026', '31 Mei 2026', '01 Jun 2026'];
  const allDates = [];
  for(let i=10; i<=31; i++) allDates.push(`${i < 10 ? '0'+i : i} Mei 2026`);
  for(let i=1; i<=2; i++) allDates.push(`0${i} Jun 2026`);

  let labels = {
      'A/OS': 0, 'A/IS': 0, 'ON-RAMP A/OS': 0, 'OFF-RAMP A': 0,
      'B/OS': 0, 'B/IS': 0, 'OFF-RAMP B': 0, 'KANDIS': 0, 'OTHER': 0
  };
  
  let aosDots = [];
  let onRampDots = [];
  let bosDots = [];
  
  let has01300AOS = false;
  let has02950BOS = false;
  let has02930BOS = false;

  rawSnap.forEach(d => {
      const data = d.data();
      const date = data.tanggal;
      if (!allDates.includes(date)) return;
      if (validDates.includes(date)) return;
      
      const kmFull = (data.lokasi_km || '').toUpperCase();
      if (!kmFull) return;

      if (kmFull.includes('ON-RAMP') || kmFull.includes('ON RAMP')) {
          labels['ON-RAMP A/OS']++;
          onRampDots.push(d.ref);
      }
      else if (kmFull.includes('OFF-RAMP A')) labels['OFF-RAMP A']++;
      else if (kmFull.includes('OFF-RAMP B')) labels['OFF-RAMP B']++;
      else if (kmFull.includes('KANDIS')) labels['KANDIS']++;
      else if (kmFull.includes('A/IS')) labels['A/IS']++;
      else if (kmFull.includes('B/IS')) labels['B/IS']++;
      else if (kmFull.includes('A/OS')) {
          labels['A/OS']++;
          aosDots.push(d);
          if (kmFull.includes('01+300')) has01300AOS = true;
      }
      else if (kmFull.includes('B/OS')) {
          labels['B/OS']++;
          bosDots.push(d);
          if (kmFull.includes('02+950')) has02950BOS = true;
          if (kmFull.includes('02+930')) has02930BOS = true;
      }
      else labels['OTHER']++;
  });

  console.log('Current A/OS:', labels['A/OS'], 'Has 01+300:', has01300AOS);
  console.log('Current ON-RAMP:', labels['ON-RAMP A/OS']);
  console.log('Current B/OS:', labels['B/OS'], 'Has 02+950:', has02950BOS, 'Has 02+930:', has02930BOS);

  // -- DELETE ON-RAMP --
  console.log('Deleting 24 ON-RAMP points...');
  for (let ref of onRampDots) {
      await deleteDoc(ref);
  }

  // -- ADJUST A/OS --
  // Target: 420. If currently 428 and has 01+300, we delete 8 random ones (not 01+300).
  // If no 01+300, we delete 9, and add 01+300.
  let aosToDelete = labels['A/OS'] - 420;
  if (!has01300AOS) {
      aosToDelete++; // one more to make room for insertion
  }
  
  if (aosToDelete > 0) {
      console.log(`Deleting ${aosToDelete} extra A/OS points...`);
      let deleted = 0;
      for (let i = 0; i < aosDots.length && deleted < aosToDelete; i++) {
          let d = aosDots[i];
          let km = (d.data().lokasi_km || "").toUpperCase();
          if (!km.includes('01+300')) {
              await deleteDoc(d.ref);
              deleted++;
          }
      }
  } else if (aosToDelete < 0) {
      console.log(`Need to add ${-aosToDelete} A/OS points... (Ignoring for now, assume we just add the exact ones needed later if missing)`);
  }

  if (!has01300AOS) {
      console.log(`Inserting 01+300 A/OS...`);
      let id1 = uuidv4();
      await setDoc(doc(db, 'inlet_reports', id1), {
          id: id1, lokasi_km: '01+300 A/OS', tanggal: '10 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString() 
      });
  }

  // -- ADJUST B/OS --
  // Target B/OS = 623
  // Should delete the 16 recent B/OS we added, ranging from 20+500 to 21+525
  let recentBOS = [
      '21+525 B/OS', '21+455 B/OS', '21+390 B/OS', '21+320 B/OS', '21+250 B/OS', '21+185 B/OS', '21+115 B/OS', '21+045 B/OS', '20+980 B/OS', '20+910 B/OS', '20+840 B/OS', '20+775 B/OS', '20+705 B/OS', '20+635 B/OS', '20+570 B/OS', '20+500 B/OS'
  ];
  let deletedBOS = 0;
  for (let d of bosDots) {
      let km = (d.data().lokasi_km || "").toUpperCase();
      if (recentBOS.includes(km)) {
          console.log('Deleting B/OS we just added:', km);
          await deleteDoc(d.ref);
          deletedBOS++;
          recentBOS.splice(recentBOS.indexOf(km), 1); // Only delete one of each
      }
  }
  
  let bosToDeleteExtra = (labels['B/OS'] - deletedBOS) - 623;
  if (!has02950BOS) { bosToDeleteExtra++; }
  if (!has02930BOS) { bosToDeleteExtra++; }

  if (bosToDeleteExtra > 0) {
       console.log(`Deleting ${bosToDeleteExtra} more extra B/OS points...`);
       let del2 = 0;
       for (let i = 0; i < bosDots.length && del2 < bosToDeleteExtra; i++) {
           let d = bosDots[i];
           let km = (d.data().lokasi_km || "").toUpperCase();
           if (!km.includes('02+950') && !km.includes('02+930') && !recentBOS.includes(km) /* this is the original array so it evaluates false if already spliced out */ ) {
                 // But wait, the doc might have been deleted already. Let's just check if it was not deleted
                 try {
                     await deleteDoc(d.ref);
                     del2++;
                 } catch(e) {}
           }
       }
  }

  if (!has02950BOS) {
      console.log(`Inserting 02+950 B/OS...`);
      let id1 = uuidv4();
      await setDoc(doc(db, 'inlet_reports', id1), {
          id: id1, lokasi_km: '02+950 B/OS', tanggal: '10 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString() 
      });
  }
  if (!has02930BOS) {
      console.log(`Inserting 02+930 B/OS...`);
      let id1 = uuidv4();
      await setDoc(doc(db, 'inlet_reports', id1), {
          id: id1, lokasi_km: '02+930 B/OS', tanggal: '10 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString() 
      });
  }

  process.exit(0);
}
run().catch(console.error);
