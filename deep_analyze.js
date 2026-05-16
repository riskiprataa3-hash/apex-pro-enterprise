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

async function deepAnalyze() {
  const activitySnap = await getDocs(collection(db, 'activities'));
  const today = "12/5/2026";
  
  const createdEntryActivities = [];
  activitySnap.docs.forEach(doc => {
    const data = doc.data();
    if (new Date(data.timestamp).toLocaleDateString('id-ID') === today) {
       if (data.type === 'entry' && data.action === 'CREATED') {
         createdEntryActivities.push(data);
       }
    }
  });

  console.log(`Today's CREATED entries in activities: ${createdEntryActivities.length}`);

  const pId = 'TbtZli8c6XY3AGtWjls5';
  const entriesSnap = await getDocs(collection(db, 'projects', pId, 'entries'));
  const entryIds = new Set(entriesSnap.docs.map(d => d.id));
  
  console.log(`Current entries count in DB: ${entriesSnap.size}`);

  let missingCount = 0;
  createdEntryActivities.forEach(act => {
    const entryId = act.metadata?.entryId;
    if (entryId && !entryIds.has(entryId)) {
       missingCount++;
       // console.log(`Missing entry detected from activity: KM ${act.description.match(/KM\s([^\s]+)/)?.[1] || 'unknown'} | ID: ${entryId}`);
    }
  });

  console.log(`Activities pointing to missing entries: ${missingCount}`);
  
  process.exit();
}

deepAnalyze();
