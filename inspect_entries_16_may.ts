import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, getDocs, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function inspect() {
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
    // Range for 16 May 2026 (WIB is UTC+7)
    // 16 May 00:00 WIB = 15 May 17:00 UTC
    // 17 May 00:00 WIB = 16 May 17:00 UTC
    const start = new Date("2026-05-15T17:00:00Z").getTime();
    const end = new Date("2026-05-16T17:00:00Z").getTime();
    
    console.log(`Searching between ${new Date(start).toISOString()} and ${new Date(end).toISOString()}`);

    const q = query(
        collectionGroup(db, 'entries'),
        where('timestamp', '>=', start),
        where('timestamp', '<', end)
    );
    const snap = await getDocs(q);
    console.log(`Ditemukan ${snap.size} entries.`);
    snap.docs.forEach(d => {
        const data = d.data();
        console.log(`ID: ${d.id}, Date: ${new Date(data.timestamp).toISOString()}, KM: ${data.km}`);
    });
    process.exit(0);
}
inspect();
