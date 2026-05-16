import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, "admin.shaka@gmail.com", "Riski1310");
  try {
     const users = await getDocs(collection(db, "workers"));
     console.log("Workers in default:", users.docs.length);
  } catch(e: any) {
     console.log("default failed:", e.message);
  }
  process.exit();
}
run();
