const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } = require('firebase/firestore');
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

  let r3_raw_docs = [];
  
  rawSnap.forEach(d => {
      const data = d.data();
      const date = data.tanggal;
      if (!allDates.includes(date)) return;
      if (validDates.includes(date)) return;
      
      const kmFull = (data.lokasi_km || '').toUpperCase();
      if (!kmFull) return;
      
      // We only care about A/OS, A/IS, ON-RAMP, B/OS, B/IS
      // Others are 70 OTHER records
      let isR3Target = kmFull.includes('ON-RAMP') || kmFull.includes('ON RAMP') || 
                       kmFull.includes('A/OS') || kmFull.includes('A/IS') ||
                       kmFull.includes('B/OS') || kmFull.includes('B/IS');
      
      if (isR3Target) {
         r3_raw_docs.push({ id: d.id, km: kmFull, date: date, data: data });
      }
  });

  console.log(`Found ${r3_raw_docs.length} raw data points for target R3 (should be 420+21+24+623+16=1104)`);

  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const entriesSnap = await getDocs(collection(db, 'projects', projectId, 'entries'));
  
  let r3_entries_docs = [];
  entriesSnap.forEach(d => {
      const data = d.data();
      const date = data.dateDisplay || data.tanggal || data.createdDay || data.date; 
      
      let entryDate = date;
      // parse date strings if they have different formats
      if (typeof date === 'string' && date.includes('-')) {
          let parts = date.split('-');
          if (parts.length === 3) { // 2026-05-21
              let d = parseInt(parts[2], 10);
              let mStr = parts[1] === '05' ? 'Mei' : (parts[1] === '06' ? 'Jun' : '');
              if (mStr) entryDate = `${d < 10 ? '0'+d : d} ${mStr} ${parts[0]}`;
          }
      } else if (typeof date === 'string' && date.includes('/')) {
          let parts = date.split('/');
          if (parts.length === 3) { // 21/5/2026
              let d = parseInt(parts[0], 10);
              let mStr = parts[1] === '5' ? 'Mei' : (parts[1] === '6' ? 'Jun' : '');
              if (mStr) entryDate = `${d < 10 ? '0'+d : d} ${mStr} ${parts[2]}`;
          }
      }
      
      let isR3 = false;
      if (allDates.includes(entryDate) && !validDates.includes(entryDate)) {
          isR3 = true;
      }
      
      if (isR3) {
          const kmFull = (data.km || '').toUpperCase();
          let isR3Target = kmFull.includes('ON-RAMP') || kmFull.includes('ON RAMP') || 
                       kmFull.includes('A/OS') || kmFull.includes('A/IS') ||
                       kmFull.includes('B/OS') || kmFull.includes('B/IS');
          if (isR3Target) {
              r3_entries_docs.push({ id: d.id, km: kmFull, date: entryDate, originalDate: date, ref: d.ref });
          }
      }
  });
  
  console.log(`Found ${r3_entries_docs.length} entry data points for R3.`);

  let matchCount = 0;
  let insertCount = 0;
  let missing = [];

  // Match raw docs to entries
  for (let raw of r3_raw_docs) {
       // match by km (we don't strictly require same date here since date formats in entries might be messy, 
       // but wait, if there are multiple same KM? R3 usually has distinct KMs. Let's just match KM.)
       let match = r3_entries_docs.find(e => e.km === raw.km && !e.matched);
       if (match) {
           match.matched = true;
           matchCount++;
       } else {
           missing.push(raw);
       }
  }

  console.log(`Matched ${matchCount}, missing ${missing.length} entries.`);

  for (let raw of missing) {
      let newId = raw.id + '_en';
      
      let entryDoc = {
          id: newId,
          km: raw.km,
          dateDisplay: raw.date,
          createdDay: raw.date,
          type: 'inlet',
          status: 'completed',
          qty: 1,
          isManual: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'projects', projectId, 'entries', newId), entryDoc);
      insertCount++;
  }

  let extraCount = 0;
  for (let entry of r3_entries_docs) {
      if (!entry.matched) {
          console.log(`Extra entry found and deleted: ${entry.km} (Date: ${entry.originalDate})`);
          await deleteDoc(entry.ref);
          extraCount++;
      }
  }

  console.log(`Inserted ${insertCount}, deleted ${extraCount} extra entries.`);
  process.exit(0);
}
run().catch(console.error);
