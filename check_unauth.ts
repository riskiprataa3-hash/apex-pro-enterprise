import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(JSONconfig);
const db = getFirestore(app, JSONconfig.firestoreDatabaseId);

async function check() {
    try {
        const snap = await getDocs(collection(db, "workers"));
        console.log("Success! Total docs:", snap.docs.length);
    } catch (err: any) {
        console.error("FAIL:", err.message);
    }
    process.exit(0);
}

check();
