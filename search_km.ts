import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function findKm(dbId: string | undefined) {
  const label = dbId || 'default';
  console.log(`Checking ${label}...`);
  const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
  
  const cols = ['inlet_reports', 'reports', 'entries'];
  for (const col of cols) {
    try {
      const q = query(collection(db, col), where('lokasi_km', '==', '17+600 A'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        console.log(`FOUND 17+600 A in ${label}.${col}!`);
        return true;
      }
      const q2 = query(collection(db, col), where('km', '==', '17+600 A'));
      const snap2 = await getDocs(q2);
       if (!snap2.empty) {
        console.log(`FOUND 17+600 A in ${label}.${col} (field km)!`);
        return true;
      }
    } catch (e) {}
  }
  return false;
}

async function run() {
  if (await findKm(undefined)) return;
  if (await findKm('blaze-db')) return;
  if (await findKm('shaka-prod-v3')) return;
  console.log("NOT FOUND ANYWHERE");
}
run();
