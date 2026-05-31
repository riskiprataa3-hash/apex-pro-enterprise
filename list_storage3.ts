import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function run() {
    try {
        const rootRef = ref(storage, 'dokumentasi 0%');
        const res = await listAll(rootRef);
        console.log("Root files in 'dokumentasi 0%':");
        for (let i = 0; i < Math.min(5, res.items.length); i++) {
            const url = await getDownloadURL(res.items[i]);
            console.log(res.items[i].fullPath, "=>", url);
        }
        
        console.log("Total items found:", res.items.length);
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
run();
