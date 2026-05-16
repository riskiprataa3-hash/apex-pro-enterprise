import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, where, query } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function findProject() {
  const q = query(collection(db, 'projects'), where('name', '==', 'PEKANBARU-DUMAI'));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.log("No project found with name PEKANBARU-DUMAI. Searching for similar names...");
    const all = await getDocs(collection(db, 'projects'));
    all.forEach(doc => {
      console.log(`ID: ${doc.id} | Name: ${doc.data().name}`);
    });
  } else {
    snap.forEach(doc => {
      console.log(`ID: ${doc.id} | Name: ${doc.data().name}`);
    });
  }
  process.exit();
}

findProject();
