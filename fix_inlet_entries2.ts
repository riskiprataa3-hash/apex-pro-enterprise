import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fixEntries2() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  console.log("Login sukses");

  const pId = "TbtZli8c6XY3AGtWjls5"; // PEKANBARU-DUMAI
  
  const entriesRef = collection(db, 'projects', pId, 'entries');
  const snap = await getDocs(entriesRef);
  
  const batch = writeBatch(db);
  let count = 0;
  
  snap.forEach(d => {
      const data = d.data();
      if (data.createdDay === "15/05/2026" && data.type === 'inlet') {
          batch.update(d.ref, {
              description: "Non-Frame",
              signType: "37x24"
          });
          count++;
      }
  });

  if (count > 0) {
      await batch.commit();
      console.log(`Updated ${count} entries setting signType to 37x24.`);
  } else {
      console.log("No entries found to update.");
  }
}
fixEntries2().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
