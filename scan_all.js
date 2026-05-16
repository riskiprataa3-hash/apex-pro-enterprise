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

async function scanAll() {
  const today = "12/5/2026";
  const activitySnap = await getDocs(collection(db, 'activities'));
  
  console.log(`Scanning all activities for ${today}...`);
  
  const userActivities = {}; // email -> activities
  
  activitySnap.forEach(doc => {
    const data = doc.data();
    if (new Date(data.timestamp).toLocaleDateString('id-ID') === today) {
       const email = data.userEmail || 'unknown';
       if (!userActivities[email]) userActivities[email] = [];
       userActivities[email].push(data);
    }
  });

  for (const email in userActivities) {
    console.log(`\nUser: ${email} | Total Actions: ${userActivities[email].length}`);
    const counts = {};
    userActivities[email].forEach(a => {
      const k = `${a.type} | ${a.action}`;
      counts[k] = (counts[k] || 0) + 1;
    });
    console.log(JSON.stringify(counts, null, 2));
  }
  
  // Check notifications for failures today
  const notifSnap = await getDocs(collection(db, 'notifications'));
  console.log(`\nChecking notifications for errors today...`);
  notifSnap.forEach(doc => {
    const data = doc.data();
    if (new Date(data.timestamp).toLocaleDateString('id-ID') === today) {
      if (data.type === 'error' || data.type === 'warning') {
        console.log(`- [${data.type.toUpperCase()}] ${data.title}: ${data.message}`);
      }
    }
  });

  process.exit();
}

scanAll();
