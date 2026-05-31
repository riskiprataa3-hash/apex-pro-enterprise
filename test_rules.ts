import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import * as fs from "fs";

const configPath = './firebase-applet-config.json';
if (!fs.existsSync(configPath)) {
    console.error("Config file not found!");
    process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testPublicRead() {
  console.log("Database ID:", firebaseConfig.firestoreDatabaseId);
  console.log("Testing public read for settings/access_code...");
  try {
    const snap = await getDoc(doc(db, 'settings', 'access_code'));
    console.log("Success! Doc exists:", snap.exists());
    if (snap.exists()) console.log("Data:", snap.data());
    else console.log("Document does not exist but read was allowed.");
  } catch (err: any) {
    console.error("FAILED to read publicly:", err.code || err.message);
  }
}

testPublicRead().catch(console.error);
