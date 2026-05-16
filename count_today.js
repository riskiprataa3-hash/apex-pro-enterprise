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

async function countTodayData() {
  const datesToCheck = ["12/5/2026", "11/5/2026", "10/5/2026"];
  console.log(`Searching for entries on: ${datesToCheck.join(", ")}`);
  
  const projectsRef = collection(db, 'projects');
  const projectsSnap = await getDocs(projectsRef);
  
  for (const date of datesToCheck) {
    let totalForDate = 0;
    console.log(`\n--- Results for ${date} ---`);
    
    for (const projectDoc of projectsSnap.docs) {
      const project = projectDoc.data();
      const entriesRef = collection(db, 'projects', projectDoc.id, 'entries');
      const entriesSnap = await getDocs(entriesRef);
      
      let count = 0;
      entriesSnap.docs.forEach(d => {
        const e = d.data();
        const dateStr = new Date(e.timestamp).toLocaleDateString('id-ID');
        if (dateStr === date) count++;
      });

      if (count > 0) {
        console.log(`Project "${project.name}": Found ${count} entries.`);
        totalForDate += count;
      }
    }
    console.log(`Total for ${date}: ${totalForDate}`);
  }
  
  if (totalToday < 73) {
    console.log(`\nWarning: You mentioned 73 inputs, but I only found ${totalToday}.`);
    console.log("Check if there are entries with different dates or if the timezone shift affected the count.");
  } else if (totalToday === 73) {
    console.log(`\nPerfect match! Found exactly 73 entries.`);
  } else {
    console.log(`\nFound more than 73 (${totalToday}). Maybe some were duplicates or from earlier in the day?`);
  }

  process.exit();
}

countTodayData().catch(console.error);
