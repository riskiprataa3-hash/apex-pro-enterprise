import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc } from "firebase/firestore";
import * as fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function wipe() {
  console.log("Wiping...");
  const incRef = collection(db, "incidents");
  const snap1 = await getDocs(incRef);
  for (const doc of snap1.docs) await deleteDoc(doc.ref);
  console.log(`Deleted ${snap1.docs.length} incidents`);
  
  const hseRef = collection(db, "hse_logs");
  const snap2 = await getDocs(hseRef);
  for (const doc of snap2.docs) await deleteDoc(doc.ref);
  console.log(`Deleted ${snap2.docs.length} HSE logs`);
  
  process.exit(0);
}
wipe().catch(e => { console.error(e); process.exit(1); });
