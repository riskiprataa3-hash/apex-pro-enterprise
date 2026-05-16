import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function inspectPhotos() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  const pId = "TbtZli8c6XY3AGtWjls5"; // PEKANBARU-DUMAI
  
  const entriesRef = collection(db, 'projects', pId, 'entries');
  const snap = await getDocs(entriesRef);
  let checked = 0;
  snap.forEach(d => {
    const data = d.data();
    if(data.type === 'inlet'){
      console.log(data.km, data.description, data.photos0);
      checked++;
    }
  });
  console.log("Total:", checked);
}
inspectPhotos().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
