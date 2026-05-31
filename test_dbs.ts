import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as fs from "fs";

const configPath = './firebase-applet-config.json';
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(firebaseConfig);

async function testBoth() {
  const dbs = [firebaseConfig.firestoreDatabaseId, "(default)"];
  
  for (const dbId of dbs) {
    try {
      console.log(`\nTesting DB: ${dbId}`);
      const db = getFirestore(app, dbId);
      const snap = await getDoc(doc(db, 'settings', 'access_code'));
      console.log(`Success! Doc exists: ${snap.exists()}`);
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`);
    }
  }
}

testBoth().catch(console.error);
