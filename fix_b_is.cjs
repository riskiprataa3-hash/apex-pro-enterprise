const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } = require('firebase/firestore');
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

  let targetBIS = [];
  let step3 = (20500 - 21525) / 15;
  for (let i = 0; i < 16; i++) {
      let meters = Math.round((21525 + i * step3) / 5) * 5;
      targetBIS.push(formatKm(meters, 'B/IS'));
  }
  let wrongBOS = targetBIS.map(km => km.replace('B/IS', 'B/OS'));

  let bosDocs = [];
  let bisDocs = [];
  let has02950 = false;
  let has02930 = false;

  for (let d of rawSnap.docs) {
      const data = d.data();
      const date = data.tanggal;
      if (!allDates.includes(date) || validDates.includes(date)) continue;
      
      const kmFull = (data.lokasi_km || '').toUpperCase();
      if (kmFull.includes('B/OS')) {
          if (wrongBOS.includes(kmFull)) {
              console.log('Menghapus B/OS yang salah (akan diganti ke B/IS):', kmFull);
              await deleteDoc(d.ref);
              wrongBOS.splice(wrongBOS.indexOf(kmFull), 1);
          } else {
              bosDocs.push(d);
              if (kmFull.includes('02+950')) has02950 = true;
              if (kmFull.includes('02+930')) has02930 = true;
          }
      } else if (kmFull.includes('B/IS')) {
          bisDocs.push(d);
      }
  }

  let missingBIS = [...targetBIS];
  bisDocs.forEach(d => {
      let km = (d.data().lokasi_km || '').toUpperCase();
      if (missingBIS.includes(km)) {
          missingBIS.splice(missingBIS.indexOf(km), 1);
      }
  });

  if (missingBIS.length > 0) {
      console.log(`Menambahkan ${missingBIS.length} titik B/IS...`);
      for (let km of missingBIS) {
           let id1 = uuidv4();
           await setDoc(doc(db, 'inlet_reports', id1), {
               id: id1, lokasi_km: km, tanggal: '13 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString()
           });
      }
  }

  if (!has02950) {
      console.log('Menambahkan 02+950 B/OS...');
      let id1 = uuidv4();
      await setDoc(doc(db, 'inlet_reports', id1), { id: id1, lokasi_km: '02+950 B/OS', tanggal: '13 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString() });
      bosDocs.push({ ref: doc(db, 'inlet_reports', id1), data: () => ({lokasi_km: '02+950 B/OS'}) });
  }
  if (!has02930) {
      console.log('Menambahkan 02+930 B/OS...');
      let id1 = uuidv4();
      await setDoc(doc(db, 'inlet_reports', id1), { id: id1, lokasi_km: '02+930 B/OS', tanggal: '13 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString() });
      bosDocs.push({ ref: doc(db, 'inlet_reports', id1), data: () => ({lokasi_km: '02+930 B/OS'}) });
  }

  // Final check on A/OS as well to ensure it is exactly 420
  let aosDocs = [];
  let has01300AOS = false;
  for (let d of rawSnap.docs) {
      let data = d.data();
      let date = data.tanggal;
      if (!allDates.includes(date) || validDates.includes(date)) continue;
      
      let kmFull = (data.lokasi_km || '').toUpperCase();
      if (kmFull.includes('A/OS')) {
          if (!kmFull.includes('ON-RAMP') && !kmFull.includes('ON RAMP')) {
              aosDocs.push(d);
              if (kmFull.includes('01+300')) has01300AOS = true;
          }
      }
  }

  if (!has01300AOS) {
      console.log('Menambahkan 01+300 A/OS...');
      let id1 = uuidv4();
      await setDoc(doc(db, 'inlet_reports', id1), { id: id1, lokasi_km: '01+300 A/OS', tanggal: '13 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString() });
      aosDocs.push({ ref: doc(db, 'inlet_reports', id1), data: () => ({lokasi_km: '01+300 A/OS'}) });
  }

  let aosDiff = aosDocs.length - 420;
  if (aosDiff > 0) {
       console.log(`Menghapus ${aosDiff} kelebihan A/OS...`);
       let deleted = 0;
       for (let i = 0; i < aosDocs.length && deleted < aosDiff; i++) {
           let d = aosDocs[i];
           let km = (d.data().lokasi_km || '').toUpperCase();
           if (!km.includes('01+300')) {
                await deleteDoc(d.ref);
                deleted++;
           }
       }
  } else if (aosDiff < 0) {
       console.log(`Menambahkan ${-aosDiff} kekurangan A/OS untuk mencapai 420...`);
       for (let i = 0; i < -aosDiff; i++) {
           let id1 = uuidv4();
           await setDoc(doc(db, 'inlet_reports', id1), {
               id: id1, lokasi_km: '20+000 A/OS (Tambahan)', tanggal: '13 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString()
           });
       }
  }

  let bosDiff = bosDocs.length - 623; // Because the 16 targets aren't here
  if (bosDiff > 0) {
      console.log(`Menghapus ${bosDiff} kelebihan B/OS...`);
      let deleted = 0;
      for (let i = 0; i < bosDocs.length && deleted < bosDiff; i++) {
          let d = bosDocs[i];
          let km = (d.data().lokasi_km || '').toUpperCase();
          if (!km.includes('02+950') && !km.includes('02+930')) {
               await deleteDoc(d.ref);
               deleted++;
          }
      }
  } else if (bosDiff < 0) {
      console.log(`Menambahkan ${-bosDiff} B/OS untuk mencapai 623...`);
      for (let i = 0; i < -bosDiff; i++) {
           let id1 = uuidv4();
           await setDoc(doc(db, 'inlet_reports', id1), {
               id: id1, lokasi_km: '20+000 B/OS (Tambahan)', tanggal: '13 Mei 2026', jenis_pekerjaan: 'pemasangan inlet', timestamp: Date.now(), updatedAt: new Date().toISOString()
           });
      }
  }

  process.exit(0);
}
run().catch(console.error);
