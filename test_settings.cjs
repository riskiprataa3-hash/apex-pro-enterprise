const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, 'shaka-v4');

async function test_query() {
  try {
        const docRef = doc(db, 'settings', 'test');
        const docSnap = await getDoc(docRef);
    console.log("SUCCESS:", docSnap.exists());
    process.exit(0);
  } catch(e) {
    console.log("FAIL:", e.message);
    process.exit(1);
  }
}
test_query();
