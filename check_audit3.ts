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
    console.log("Logged in");
    
    const snap = await getDocs(query(collection(db, "workers"), where("email", "==", "audit.shaka01@gmail.com")));
    console.log("Audits found:", snap.docs.length);
    snap.docs.forEach(d => console.log(d.data()));
    process.exit(0);
}

check();
