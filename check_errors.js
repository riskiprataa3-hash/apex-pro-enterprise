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

async function checkErrors() {
  const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(50));
  const snap = await getDocs(q);
  
  console.log("Recent Notifications/Errors:");
  snap.forEach(doc => {
    const data = doc.data();
    const date = new Date(data.timestamp).toLocaleString('id-ID');
    console.log(`[${date}] ${data.type.toUpperCase()}: ${data.title} - ${data.message}`);
  });
  
  process.exit();
}

checkErrors();
