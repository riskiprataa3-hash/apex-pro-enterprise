import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const storage = getStorage(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const proxyUrl = "https://wsrv.nl/?url=" + encodeURIComponent("https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/projects%2FPeoYol4P6rE9p1c7s8Wb%2F17466666_logo.png?alt=media") + "&w=640&h=480&fit=inside&output=jpg&q=60";
  console.log("Proxy URl:", proxyUrl);
  try {
    const res = await fetch(proxyUrl);
    console.log("Response OK?", res.ok, res.status);
  } catch(e) {
    console.error(e);
  }
}
run();
