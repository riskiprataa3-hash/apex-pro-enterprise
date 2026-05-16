import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function checkKM() {
  const pId = 'TbtZli8c6XY3AGtWjls5';
  const snap = await getDocs(collection(db, 'projects', pId, 'entries'));
  
  const todayEntries = [];
  const today = "12/5/2026";
  
  snap.forEach(doc => {
    const data = doc.data();
    if (new Date(data.timestamp).toLocaleDateString('id-ID') === today) {
       todayEntries.push({ id: doc.id, km: data.km, time: new Date(data.timestamp).toLocaleTimeString('id-ID') });
    }
  });

  todayEntries.sort((a, b) => a.km.localeCompare(b.km));

  console.log(`Entries for today (${today}):`);
  todayEntries.forEach(e => {
    console.log(`- KM ${e.km} | Time: ${e.time} | ID: ${e.id}`);
  });
  
  console.log(`\nTotal count: ${todayEntries.length}`);
  
  process.exit();
}

checkKM();
