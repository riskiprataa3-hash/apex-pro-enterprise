import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    console.log("Logged in");
    
    const reports = await getDocs(collection(db, 'inlet_reports'));
    const counts: Record<string, number> = {};
    reports.forEach(d => {
        const data = d.data();
        counts[data.tanggal] = (counts[data.tanggal] || 0) + 1;
    });
    console.log(counts);
    process.exit(0);
}
run();
