import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const cfg = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(cfg);
const db = getFirestore(app, "shaka-v4");
const auth = getAuth(app);

const toKeep = ["17+415 A/OS", "17+410 A/OS", "17+405 A/OS", "17+390 A/OS", "17+385 A/OS", "16+700 A/OS"];

async function check() {
    await signInWithEmailAndPassword(auth, "adminshaka01@gmail.com", "Riski1310");
    const q1 = query(collection(db, "projects"), where("name", "==", "PEKANBARU-DUMAI"));
    const sm = await getDocs(q1);
    let id = "";
    sm.forEach(d => id = d.id);
    
    const dStart = new Date(2026, 4, 26, 0, 0, 0).getTime();
    const dEnd = new Date(2026, 4, 26, 23, 59, 59).getTime();
    
    const ep = await getDocs(query(collection(db, "projects", id, "entries"), where("timestamp", ">=", dStart), where("timestamp", "<=", dEnd)));
    for (const d of ep.docs) {
        if (!toKeep.includes(d.data().km)) {
            console.log("Deleting duplicate/bad entry:", d.id, d.data().km);
            await deleteDoc(doc(db, "projects", id, "entries", d.id));
        }
    }
    
    const rep = await getDocs(query(collection(db, "inlet_reports"), where("tanggal", "==", "26 Mei 2026")));
    for(const d of rep.docs) {
        if (!toKeep.includes(d.data().lokasi_km)) {
            console.log("Deleting report duplicate/bad entry:", d.id, d.data().lokasi_km);
            await deleteDoc(doc(db, "inlet_reports", d.id));
        }
    }
    
    process.exit(0);
}
check();
