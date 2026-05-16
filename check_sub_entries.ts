import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);

async function run() {
  const db = getFirestore(app, "shaka-prod-v3");
  const projectId = "TbtZli8c6XY3AGtWjls5";
  
  const entriesSnap = await getDocs(collection(db, 'projects', projectId, 'entries'));
  console.log(`Subcollection entries for project ${projectId}: ${entriesSnap.size} docs`);
  if (entriesSnap.size > 0) {
    console.log("Sample Entry:", JSON.stringify(entriesSnap.docs[0].data(), null, 2));
  }
}
run();
