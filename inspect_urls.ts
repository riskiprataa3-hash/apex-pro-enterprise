import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function inspect() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  const snap = await getDocs(collection(db, 'projects', "TbtZli8c6XY3AGtWjls5", 'entries'));
  
  let i = 0;
  snap.forEach(d => {
    const data = d.data();
    if(data.type === 'inlet' && data.createdDay === "15/05/2026" && i < 2){
      console.log(data.km);
      console.log("0:", data.photos0);
      console.log("50:", data.photos50);
      console.log("100:", data.photos100);
      i++;
    }
  });
}
inspect().then(() => process.exit(0));
