import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching projects...");
  const projectsSnap = await getDocs(collection(db, 'projects'));
  console.log(`Found ${projectsSnap.size} projects:`);
  
  for (const doc of projectsSnap.docs) {
    const proj = doc.data();
    console.log(`- Project [ID: ${doc.id}] Name: "${proj.name}", Type: "${proj.type}"`);
    
    const entriesSnap = await getDocs(collection(db, 'projects', doc.id, 'entries'));
    console.log(`  -> Has ${entriesSnap.size} entries.`);
    
    const entries = entriesSnap.docs.map(e => e.data());
    const kmValues = entries.map(e => ({ km: e.km, status: e.status }));
    console.log(`  -> Entries KM & Status:`, JSON.stringify(kmValues.slice(0, 15), null, 2));
  }
}

run().catch(err => {
  console.error("Error running query:", err);
});
