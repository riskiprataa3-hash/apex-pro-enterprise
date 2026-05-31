import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll } from "firebase/storage";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function run() {
    try {
        const rootRef = ref(storage, 'dokumentasi 10O%');
        const res = await listAll(rootRef);
        console.log(`Folder: dokumentasi 10O%, total files: ${res.items.length}`);
        const files = res.items.map(i => i.fullPath).sort();
        console.log(files.slice(0, 10));
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
run();
