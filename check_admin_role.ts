import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, JSONconfig.firestoreDatabaseId);

async function check() {
    await signInWithEmailAndPassword(auth, "adminshaka01@gmail.com", "Riski1310");
    try {
        const snap = await getDocs(query(collection(db, "workers"), where("email", "==", "riskiprataa3@gmail.com")));
        snap.docs.forEach(d => console.log(d.id, d.data()));
    } catch(err: any) {
        console.error(err.message);
    }
    process.exit(0);
}
check();

