const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspect() {
  try {
    const q = query(collection(db, 'projects'), where('name', '==', 'PEKANBARU-DUMAI'));
    const snapshot = await getDocs(q);
    console.log("Found:", snapshot.size);
    for (const doc of snapshot.docs) {
      console.log(doc.id, doc.data());
      const entries = await getDocs(collection(db, 'projects', doc.id, 'entries'));
      console.log(`Entries: ${entries.size}`);
    }
    process.exit(0);
  } catch (error) {
    console.error("Error inspecting:", error);
    process.exit(1);
  }
}

inspect();
