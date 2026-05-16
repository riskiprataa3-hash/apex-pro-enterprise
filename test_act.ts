import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, limit, getDocs, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function testActivities() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  
  try {
    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
    const q = query(collection(db, 'activities'), where('timestamp', '<', twoDaysAgo), limit(200));
    console.log('Querying activities...');
    const snap = await getDocs(q);
    console.log(`Found ${snap.size} old activities.`);
    
    if (snap.size > 0) {
      console.log('Trying to delete one...');
      const batch = writeBatch(db);
      batch.delete(snap.docs[0].ref);
      await batch.commit();
      console.log('Deleted successfully.');
    }
  } catch(e: any) {
    console.error('Error:', e.message);
  }
  
  process.exit(0);
}

testActivities();
