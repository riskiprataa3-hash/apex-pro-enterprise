import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "shaka-prod-v3");

async function testWrite() {
  try {
    const docRef = await addDoc(collection(db, 'projects', 'TbtZli8c6XY3AGtWjls5', 'entries'), {
      km: 'KM TEST',
      timestamp: Date.now(),
      status: 'completed',
      userEmail: 'system-test'
    });
    console.log("Write success: " + docRef.id);
  } catch (e) {
    console.error("Write failed: " + e.message);
  }
  process.exit();
}

testWrite();
