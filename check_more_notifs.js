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

async function checkMoreNotifications() {
  const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(200));
  const snap = await getDocs(q);
  
  let addedCount = 0;
  snap.forEach(doc => {
    const data = doc.data();
    if (data.title === 'Data Ditambahkan') {
       addedCount++;
    }
  });
  
  console.log(`Total "Data Ditambahkan" notifications in last 200: ${addedCount}`);
  
  process.exit();
}

checkMoreNotifications();
