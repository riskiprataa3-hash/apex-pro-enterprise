import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);

async function check() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  
  const dbs = ['(default)', 'shaka-v4', 'shaka-prod-v3'];
  for (const dbName of dbs) {
    try {
      const db = getFirestore(app, dbName);
      await getDocs(query(collection(db, 'projects'), limit(1)));
      console.log(`✅ DB: ${dbName} works`);
    } catch (e: any) {
      console.log(`❌ DB: ${dbName} failed: ${e.message}`);
    }
  }
  process.exit(0);
}
check();
