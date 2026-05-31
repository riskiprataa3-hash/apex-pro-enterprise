import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const cfg = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(cfg);
const db = getFirestore(app, "shaka-v4");
const auth = getAuth(app);

async function check() {
    await signInWithEmailAndPassword(auth, "adminshaka01@gmail.com", "Riski1310");
    const q1 = query(collection(db, "projects"), where("name", "==", "PEKANBARU-DUMAI"));
    const sm = await getDocs(q1);
    let id = "";
    sm.forEach(d => id = d.id);
    
    if(!id) { console.log("not found"); return; }
    
    const dStart = new Date(2026, 4, 26, 0, 0, 0).getTime();
    const dEnd = new Date(2026, 4, 26, 23, 59, 59).getTime();
    
    const ep = await getDocs(query(collection(db, "projects", id, "entries"), where("timestamp", ">=", dStart), where("timestamp", "<=", dEnd)));
    console.log("Count for 26 May:", ep.size);
    ep.forEach(d => {
        console.log(d.id, d.data().km, d.data().photos0?.[0]);
    });
    process.exit(0);
}
check();
