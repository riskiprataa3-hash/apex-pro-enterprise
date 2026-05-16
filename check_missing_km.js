import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, collectionGroup } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function checkMissingKM() {
  const snap = await getDocs(collectionGroup(db, 'entries'));
  console.log(`Total entries: ${snap.size}`);
  
  let missingKM = 0;
  snap.forEach(doc => {
    const data = doc.data();
    if (!data.km || data.km.trim() === '') {
      missingKM++;
      console.log(`Entry ${doc.id} missing KM. Project: ${doc.ref.parent.parent?.id}`);
    }
  });
  
  console.log(`Entries missing KM: ${missingKM}`);
  process.exit();
}

checkMissingKM();
