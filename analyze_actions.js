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

async function analyzeActions() {
  const activitySnap = await getDocs(collection(db, 'activities'));
  const today = "12/5/2026";
  
  const stats = {};
  activitySnap.docs.forEach(doc => {
    const data = doc.data();
    if (new Date(data.timestamp).toLocaleDateString('id-ID') === today) {
       const key = `${data.type} | ${data.action}`;
       stats[key] = (stats[key] || 0) + 1;
       if (data.action === 'DELETED') {
         console.log(`DELETED Activity: ${data.description}`);
       }
    }
  });

  console.log("\nToday's Activity Stats:");
  console.log(JSON.stringify(stats, null, 2));
  
  process.exit();
}

analyzeActions();
