import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, JSONconfig.firestoreDatabaseId);

const tempApp = initializeApp(JSONconfig, "TempSyncApp");
const tempAuth = getAuth(tempApp);

async function syncWorkers() {
    await signInWithEmailAndPassword(auth, "adminshaka01@gmail.com", "Riski1310");
    console.log("Logged in to sync");
    
    const snap = await getDocs(collection(db, "workers"));
    for (const doc of snap.docs) {
        const data = doc.data();
        if (data.email && data.password && typeof data.password === "string") {
            try {
                await createUserWithEmailAndPassword(tempAuth, data.email.toLowerCase().trim(), data.password.trim());
                console.log(`Created auth account for ${data.email}`);
            } catch (err: any) {
                if (err.code !== 'auth/email-already-in-use') {
                    console.error(`Failed to create ${data.email}: ${err.message}`);
                }
            }
        }
    }
    console.log("Sync complete");
    process.exit(0);
}

syncWorkers();
