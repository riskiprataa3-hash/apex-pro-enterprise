import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function addSingle() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  console.log("Login sukses");
  try {
     console.log("Menambahkan satu dokumen inlet_reports");
     const docRef = await addDoc(collection(db, 'test'), {
         "test": "123"
     });
     console.log("Success: ", docRef.id);
  } catch (e) {
     console.error(e);
  }
}
addSingle().then(() => process.exit(0)).catch(()=>process.exit(1));
