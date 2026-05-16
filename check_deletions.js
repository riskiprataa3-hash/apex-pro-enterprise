import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function checkDeletions() {
  const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), limit(100));
  const snap = await getDocs(q);
  
  snap.forEach(doc => {
    const data = doc.data();
    if (data.action === 'DELETED') {
      console.log(`[${new Date(data.timestamp).toLocaleString('id-ID')}] DELETED: ${data.description}`);
    }
  });
  
  process.exit();
}

checkDeletions();
