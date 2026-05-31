const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, 'shaka-v4');

async function test_query() {
  try {
        const keysRef = collection(db, 'access_keys');
        const keyQ = query(keysRef, where('password', '==', '1234'), where('status', '==', 'active'));
        const keySnap = await getDocs(keyQ);
    console.log("SUCCESS:", keySnap.size);
    process.exit(0);
  } catch(e) {
    console.log("FAIL:", e.message);
    process.exit(1);
  }
}
test_query();
