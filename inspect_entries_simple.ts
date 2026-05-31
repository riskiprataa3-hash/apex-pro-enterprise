import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, getDocs, limit, query } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function inspect() {
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
    const q = query(collectionGroup(db, 'entries'), limit(20));
    const snap = await getDocs(q);
    console.log(`Ditemukan ${snap.size} entries total.`);
    snap.docs.forEach(d => {
        const data = d.data();
        console.log(`ID: ${d.id}, Date: ${new Date(data.timestamp).toISOString()}, Raw TS: ${data.timestamp}`);
    });
    process.exit(0);
}
inspect();
