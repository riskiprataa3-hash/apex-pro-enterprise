import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll } from "firebase/storage";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function list() {
    try {
        const root = ref(storage);
        const dirs = await listAll(root);

        for (const p of dirs.prefixes) {
             const sub = await listAll(p);
             console.log(`\nItems in ${p.fullPath} (count: ${sub.items.length}):`);
             console.log(sub.items.map(i => i.fullPath).sort().join("\n"));
        }

    } catch(e) {
        console.error(e);
    }
}
list();
