import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(JSONconfig);
const db = getFirestore(app, "shaka-v4");

async function check() {
    const qEmail = query(collection(db, "workers"), where("email", "==", "audit.shaka01@gmail.com"));
    const snap = await getDocs(qEmail);
    console.log("Empty:", snap.empty);
    snap.docs.forEach(doc => {
        console.log(doc.id, "=>", doc.data());
    });
    process.exit(0);
}

check();
