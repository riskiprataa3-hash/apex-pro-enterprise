import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query, where } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function checkSpecificEntry() {
  const pId = 'TbtZli8c6XY3AGtWjls5';
  const q = query(collection(db, 'projects', pId, 'entries'), limit(5));
  const snap = await getDocs(q);
  
  console.log(`Found ${snap.size} entries for project ${pId}`);
  snap.forEach(doc => {
     console.log(`KM: ${doc.data().km}`);
  });
  
  process.exit();
}

checkSpecificEntry();
