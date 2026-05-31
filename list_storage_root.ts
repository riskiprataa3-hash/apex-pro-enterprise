import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll } from "firebase/storage";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function run() {
    try {
        const rootRef = ref(storage, '/');
        const res = await listAll(rootRef);
        console.log("Root prefixes:");
        for (const pre of res.prefixes) {
            console.log("Pre:", pre.fullPath);
        }
        console.log("Root items:");
        for (const item of res.items) {
            console.log("Item:", item.fullPath);
        }
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
run();
