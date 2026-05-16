import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";
import { getStorage, ref, listAll } from "firebase/storage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function fixPhotosCloud() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  console.log("Login sukses");

  const list0 = await listAll(ref(storage, 'dokumentasi O%'));
  const list50 = await listAll(ref(storage, 'dokumentasi 5O%'));
  const list100 = await listAll(ref(storage, 'dokumentasi 10O%'));

  const urls0 = list0.items.map(item => `gs://gen-lang-client-0223554772.firebasestorage.app/${item.fullPath}`);
  const urls50 = list50.items.map(item => `gs://gen-lang-client-0223554772.firebasestorage.app/${item.fullPath}`);
  const urls100 = list100.items.map(item => `gs://gen-lang-client-0223554772.firebasestorage.app/${item.fullPath}`);

  console.log(`Found ${urls0.length} photos 0%, ${urls50.length} photos 50%, ${urls100.length} photos 100%`);

  const pId = "TbtZli8c6XY3AGtWjls5"; // PEKANBARU-DUMAI
  
  const entriesRef = collection(db, 'projects', pId, 'entries');
  const snap = await getDocs(entriesRef);
  
  const batch = writeBatch(db);
  let count = 0;
  
  snap.forEach(d => {
      const data = d.data();
      if (data.createdDay === "15/05/2026" && data.type === 'inlet') {
          // pick randomly
          const u0 = urls0.length > 0 ? urls0[count % urls0.length] : "";
          const u50 = urls50.length > 0 ? urls50[count % urls50.length] : "";
          const u100 = urls100.length > 0 ? urls100[count % urls100.length] : "";
          
          batch.update(d.ref, {
              description: "Non-Frame", 
              signType: "37x24", // ensure size is there
              photos0: u0 ? [u0] : [],
              photos50: u50 ? [u50] : [],
              photos100: u100 ? [u100] : []
          });
          count++;
      }
  });

  if (count > 0) {
      await batch.commit();
      console.log(`Updated photos for ${count} entries with real storage files.`);
  } else {
      console.log("No entries found to update.");
  }
}
fixPhotosCloud().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
