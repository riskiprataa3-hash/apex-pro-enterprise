import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, JSONconfig.firestoreDatabaseId);

const tempApp = initializeApp(JSONconfig, "TempSyncApp");
const tempAuth = getAuth(tempApp);

async function register() {
    await signInWithEmailAndPassword(auth, "adminshaka01@gmail.com", "Riski1310");
    console.log("Logged in to sync");
    
    const email = "audit.shaka01@gmail.com";
    const pass = "19451234";
    
    // Create in Auth
    try {
        await createUserWithEmailAndPassword(tempAuth, email, pass);
        console.log(`Created auth account for ${email}`);
    } catch (err: any) {
        if (err.code !== 'auth/email-already-in-use') {
            console.error(`Failed to create ${email}: ${err.message}`);
        } else {
            console.log(`Auth account for ${email} already exists.`);
        }
    }
    
    // Add to Firestore DB
    const snap = await getDocs(query(collection(db, "workers"), where("email", "==", email)));
    if (snap.empty) {
        await addDoc(collection(db, "workers"), {
            email: email,
            password: pass,
            name: "TIM AUDIT SHAKA",
            employeeId: "AUDIT-01",
            role: "viewer",
            createdAt: Date.now()
        });
        console.log("Added to Firestore workers.");
    } else {
        console.log("Already exists in Firestore, updating...");
        await updateDoc(doc(db, "workers", snap.docs[0].id), {
            password: pass,
            name: "TIM AUDIT SHAKA",
            role: "viewer" // Ensure it is viewer
        });
    }
    
    process.exit(0);
}

register();
