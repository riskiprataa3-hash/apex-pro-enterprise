const { initializeApp } = require('firebase/app');
const { getStorage, ref, listAll } = require('firebase/storage');
const { readFileSync } = require('fs');

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const storage = getStorage(app, "gs://" + (JSONconfig.storageBucket || "gen-lang-client-0223554772.firebasestorage.app"));

async function run() {
    const rootRef = ref(storage, '/');
    const res = await listAll(rootRef);
    console.log("Root prefixes:");
    res.prefixes.forEach((folderRef) => {
        console.log("Folder:", folderRef.name);
    });
    process.exit(0);
}
run();
