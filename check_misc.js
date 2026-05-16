import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function checkMiscellaneous() {
  const collectionsToCheck = ['reports', 'logs', 'entries'];
  for (const cName of collectionsToCheck) {
     console.log(`\n--- Checking collection: ${cName} ---`);
     try {
       const snap = await getDocs(collection(db, cName));
       console.log(`Count: ${snap.size}`);
       if (snap.size > 0) {
          snap.docs.slice(0, 5).forEach(d => console.log(JSON.stringify(d.data()).substring(0, 100)));
       }
     } catch (e) {
       console.log(`Failed or empty: ${e.message}`);
     }
  }
  process.exit();
}

checkMiscellaneous();
