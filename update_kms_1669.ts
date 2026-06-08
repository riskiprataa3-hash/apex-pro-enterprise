import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, "shaka-v4");

function pad(n) { return n.toString().padStart(3, "0"); }

let targetKMs = [];
targetKMs.push("08+000 A/OS");
targetKMs.push("08+600 A/OS");
targetKMs.push("08+800 A/OS");
targetKMs.push("08+850 A/OS");
targetKMs.push("08+900 A/OS");
targetKMs.push("08+950 A/OS");
targetKMs.push("09+000 A/OS");
targetKMs.push("09+200 A/OS");
targetKMs.push("Akses Keluar Kandis Selatan");
targetKMs.push("12+200 B/OS");
targetKMs.push("08+000 B/OS");
targetKMs.push("08+000 B/OS");

targetKMs.push("74+800 B/OS");
targetKMs.push("74+800 B/OS");
for(let i=0; i<35; i++) {
  let kmVal = 61; let mVal = 400 - (i * 10);
  if (mVal < 0) { kmVal--; mVal += 1000; }
  targetKMs.push(pad(kmVal) + "+" + pad(mVal) + " B/OS");
}
targetKMs.push("55+610 B/OS");
targetKMs.push("55+150 B/OS");
for(let i=0; i<11; i++) {
  let mVal = 400 - (i * 10);
  targetKMs.push("44+" + pad(mVal) + " B/OS");
}

for(let i=0; i<17; i++) targetKMs.push("44+" + pad(i*10) + " A/OS");
for(let i=0; i<17; i++) {
  let kmVal = 54; let mVal = 980 + (i * 10);
  if (mVal >= 1000) { kmVal++; mVal -= 1000; }
  targetKMs.push(pad(kmVal) + "+" + pad(mVal) + " A/OS");
}
for(let i=0; i<40; i++) {
  let kmVal = 60; let mVal = 300 + (i * 10);
  if (mVal >= 1000) { kmVal++; mVal -= 1000; }
  targetKMs.push(pad(kmVal) + "+" + pad(mVal) + " A/OS");
}
for(let i=0; i<43; i++) {
  let kmVal = 74; let mVal = 400 + (i * 10);
  if (mVal >= 1000) { kmVal++; mVal -= 1000; }
  targetKMs.push(pad(kmVal) + "+" + pad(mVal) + " A/OS");
}

targetKMs.push("01+300 A/OS");
for(let i=0; i<13; i++) targetKMs.push("08+" + pad(200 + i*10) + " A/IS");
for(let i=0; i<8; i++) targetKMs.push("11+" + pad(490 + i*10) + " A/IS");
for(let i=0; i<24; i++) targetKMs.push("00+" + pad(230 + i*10) + " JALAN MASUK");
for(let i=0; i<805; i++) targetKMs.push("20+" + pad(i % 1000) + " A/OS");

targetKMs.push("02+950 B/OS");
targetKMs.push("02+930 B/OS");
for(let i=0; i<16; i++) targetKMs.push("21+" + pad(500 - i*10) + " B/IS");
for(let i=0; i<621; i++) targetKMs.push("30+" + pad(i % 1000) + " B/OS");

console.log("Total Generated labels:", targetKMs.length);

async function run() {
  await signInWithEmailAndPassword(auth, "adminshaka01@gmail.com", "Riski1310");
  const dps = await getDocs(collection(db, "projects"));
  let id = "";
  dps.forEach(d => { if (d.data().name.includes("PEKANBARU")) id = d.id; });
  if(!id) return;
  const entriesSnap = await getDocs(collection(db, "projects/" + id + "/entries"));
  console.log("Got entries from DB:", entriesSnap.size);

  let index = 0;
  let batch = writeBatch(db);
  let batchCount = 0;
  for(let d of entriesSnap.docs) {
     if(index >= targetKMs.length) break;
     let km = targetKMs[index];
     batch.update(doc(db, "projects/" + id + "/entries", d.id), { km: km, kmStr: km });
     index++;
     batchCount++;
     if (batchCount === 400) {
         await batch.commit(); batch = writeBatch(db); batchCount = 0;
         console.log("Committed 400...");
     }
  }
  if (batchCount > 0) { await batch.commit(); console.log("Committed remaining..."); }
  console.log("Done mapping.");
  process.exit(0);
}
run().catch(console.error);
