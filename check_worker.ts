import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import * as fs from "fs";

const configPath = './firebase-applet-config.json';
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function checkWorker() {
  const dbs = [firebaseConfig.firestoreDatabaseId, "(default)"];
  for (const dbId of dbs) {
    try {
      console.log(`\nTesting DB: ${dbId}`);
      const db = getFirestore(app, dbId);
      const q = query(collection(db, 'workers'), where('email', '==', 'pelaksana.shaka@gmail.com'));
      const snap = await getDocs(q);
      if (snap.empty) {
        console.log("NOT FOUND");
      } else {
        console.log("FOUND:", snap.docs[0].data());
      }
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`);
    }
  }
}

checkWorker().catch(console.error);
