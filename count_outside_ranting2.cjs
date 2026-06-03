const { initializeApp } = require('firebase/app');
const { getFirestore, collectionGroup, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, "shaka-v4");

function getKmValue(kmString) {
    if (!kmString) return -1;
    let clean = kmString.replace(/A\/OS|B\/OS|A\/IS|B\/IS/g, '').trim();
    if (clean.includes('+')) {
        let parts = clean.split('+');
        let parsed = parseInt(parts[0]) * 1000 + parseInt(parts[1]);
        if (!isNaN(parsed)) return parsed;
    }
    // Handle Kandis Selatan etc
    if (kmString.includes("Kandis")) return 999999;
    return -1;
}

async function run() {
  await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
  
  const entriesSnap = await getDocs(collectionGroup(db, 'entries'));
  const validDates = ["29 Mei 2026", "30 Mei 2026", "31 Mei 2026", "01 Jun 2026"];

  let outsideRanting2 = { aos: [], bos: [] };
  let ranting2Count = 0;

  entriesSnap.forEach(d => {
      const data = d.data();
      if (!validDates.includes(data.dateDisplay)) return;
      if (data.type !== "inlet") return;

      const kmFull = data.km || "";
      const kmVal = getKmValue(kmFull);
      if (kmVal === -1) return;

      // Define Ranting 2 boundary (>= 40000 and <= 75000, wait, Kandis Selatan is outside? "Akses Keluar Kandis Selatan" -> previously user didn't care or it was 999999)
      // Usually Ranting 2 is 40.000 to 75.000.
      if (kmVal >= 40000 && kmVal <= 75000) {
          ranting2Count++;
      } else {
          let isAOS = kmFull.includes("A/OS");
          let isBOS = kmFull.includes("B/OS");

          if (isAOS) outsideRanting2.aos.push(kmFull);
          else if (isBOS) outsideRanting2.bos.push(kmFull);
          else outsideRanting2.bos.push(kmFull); // fallback if no direction
      }
  });

  const uniqueAndSort = (arr) => {
      return [...new Set(arr)].sort((a,b) => getKmValue(a) - getKmValue(b));
  };

  const finalAos = uniqueAndSort(outsideRanting2.aos);
  const finalBos = uniqueAndSort(outsideRanting2.bos);

  console.log(`\n=== DATA DI LUAR RANTING 2 (29 Mei - 1 Jun) ===`);
  console.log(`(KM < 40+000 atau KM > 75+000)`);
  
  console.log(`\n--- A/OS ---`);
  console.log(`Jumlah Ditemukan: ${finalAos.length} titik`);
  if (finalAos.length > 0) console.log(finalAos.join(', '));

  console.log(`\n--- B/OS ---`);
  console.log(`Jumlah Ditemukan: ${finalBos.length} titik`);
  if (finalBos.length > 0) console.log(finalBos.join(', '));

  process.exit(0);
}

run().catch(console.error);
