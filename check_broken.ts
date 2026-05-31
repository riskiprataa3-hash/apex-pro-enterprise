import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, documentId, doc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function checkBroken() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');

    console.log("Fetching all inlet_reports...");
    const rawReportsSnapshot = await getDocs(collection(db, "inlet_reports"));
    console.log("Total records:", rawReportsSnapshot.size);

    let brokenCount = 0;
    
    // We only check if the URL contains '%2Fprojects%2F' because that folder seems to be broken.
    // the valid ones use '%2Fdokumentasi%20O%25%2F'
    rawReportsSnapshot.forEach(d => {
        const data = d.data();
        let hasBroken = false;
        if (data.foto_0 && data.foto_0.includes('%2Fprojects%2F')) hasBroken = true;
        if (data.foto_50 && data.foto_50.includes('%2Fprojects%2F')) hasBroken = true;
        if (data.foto_100 && data.foto_100.includes('%2Fprojects%2F')) hasBroken = true;
        if (hasBroken) brokenCount++;
    });

    console.log("Records with broken images (using /projects/ path):", brokenCount);
    process.exit(0);
}
checkBroken().catch(console.error);
