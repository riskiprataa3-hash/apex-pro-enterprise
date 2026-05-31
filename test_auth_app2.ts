import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app1 = initializeApp(JSONconfig);
const auth1 = getAuth(app1);

const app2 = initializeApp(JSONconfig, "TempApp");
const auth2 = getAuth(app2);

async function check() {
    await signInWithEmailAndPassword(auth1, "adminshaka01@gmail.com", "Riski1310");
    console.log("App1 authenticated as", auth1.currentUser?.email);

    // Now create via app2
    try {
        await createUserWithEmailAndPassword(auth2, "testuser_temp2@gmail.com", "12345678");
        console.log("App2 created user / authenticated as", auth2.currentUser?.email);
    } catch (e: any) {
         console.error("Create user failed:", e.message);
    }
    
    console.log("App1 is STILL authenticated as", auth1.currentUser?.email);
    process.exit(0);
}

check();
