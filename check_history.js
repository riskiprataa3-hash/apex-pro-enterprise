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

async function checkHistory() {
  const activitySnap = await getDocs(collection(db, 'activities'));
  const userCounts = {}; // email -> { day -> { action -> count } }
  
  activitySnap.forEach(doc => {
    const data = doc.data();
    const date = new Date(data.timestamp).toLocaleDateString('id-ID');
    const email = data.userEmail || 'unknown';
    const action = data.action;
    
    if (!userCounts[email]) userCounts[email] = {};
    if (!userCounts[email][date]) userCounts[email][date] = {};
    userCounts[email][date][action] = (userCounts[email][date][action] || 0) + 1;
  });

  console.log(JSON.stringify(userCounts, null, 2));
  process.exit();
}

checkHistory();
