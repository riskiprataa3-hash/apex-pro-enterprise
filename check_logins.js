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

async function checkLogins() {
  const snap = await getDocs(collection(db, 'login_logs'));
  const today = "12/5/2026";
  
  const activeUsers = new Set();
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (new Date(data.timestamp).toLocaleDateString('id-ID') === today) {
       activeUsers.add(data.email);
    }
  });

  console.log(`Active users today (${today}):`);
  activeUsers.forEach(u => console.log(`- ${u}`));
  
  process.exit();
}

checkLogins();
