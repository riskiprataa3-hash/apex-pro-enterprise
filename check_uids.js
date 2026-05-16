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

async function checkUIDs() {
  const snap = await getDocs(collection(db, 'workers'));
  const uids = ["lyRdo9fqX2QV8r2QgdPEFL1AA2D2", "WrCNVgmEWfOKDIAABbefVDR9whH3"];
  
  snap.docs.forEach(doc => {
     const data = doc.data();
     // Workers usually don't have UID in the doc, but they have email.
     // I'll print them all.
     console.log(`Worker: ${data.name} | Email: ${data.email} | ID: ${data.employeeId}`);
  });

  // Check login_logs for the UIDs
  const loginSnap = await getDocs(collection(db, 'login_logs'));
  loginSnap.docs.forEach(doc => {
    const data = doc.data();
    if (uids.includes(data.userId)) {
      console.log(`UID ${data.userId} belongs to ${data.email}`);
    }
  });

  process.exit();
}

checkUIDs();
