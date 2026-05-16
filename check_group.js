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

async function checkCollectionGroup() {
  const snap = await getDocs(collectionGroup(db, 'entries'));
  console.log(`Total entries found via collectionGroup: ${snap.size}`);
  
  process.exit();
}

checkCollectionGroup();
