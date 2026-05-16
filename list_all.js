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

async function listAll() {
  // listCollections is only available in Admin SDK or through some other means in web SDK?
  // Actually, Web SDK doesn't support listCollections.
  // I have to guess names or check the code.
  
  const known = [
    'projects', 'workers', 'presensi', 'notifications', 'login_logs', 
    'activities', 'fuel_logs', 'hse_logs', 'apd_checks', 'incidents', 
    'equipment_requests', 'inventory', 'cash_advances', 'access_keys'
  ];

  for (const c of known) {
    const snap = await getDocs(collection(db, c));
    if (snap.size > 0) {
      console.log(`Collection ${c}: ${snap.size} docs`);
    }
  }
  
  process.exit();
}

listAll();
