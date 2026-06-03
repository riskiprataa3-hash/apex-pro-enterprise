const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, listCollections } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const JSONconfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
  // listCollections is only on server SDK though.
  // let's just check well-known paths.
  console.log('Not easy to list collections on client');
  process.exit(0);
}
run();
