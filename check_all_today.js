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

async function checkAllProjects() {
  const projectsRef = collection(db, 'projects');
  const snap = await getDocs(projectsRef);
  const today = "12/5/2026";
  
  console.log(`Checking all projects for entries on ${today}...`);
  
  for (const doc of snap.docs) {
    const p = doc.data();
    const entriesRef = collection(db, 'projects', doc.id, 'entries');
    const eSnap = await getDocs(entriesRef);
    
    let count = 0;
    eSnap.docs.forEach(ed => {
       if (new Date(ed.data().timestamp).toLocaleDateString('id-ID') === today) count++;
    });
    
    if (count > 0) {
      console.log(`- Project: ${p.name} | Type: ${p.type} | Count: ${count}`);
    }
  }
  process.exit();
}

checkAllProjects();
