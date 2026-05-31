import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, setDoc, query, where, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    console.log("Logged in");
    
    const reportsQuery = query(collection(db, 'inlet_reports'), where('jenis_pekerjaan', '==', 'pemasangan inlet'));
    const reports = await getDocs(reportsQuery);
    
    let batch = writeBatch(db);
    let count = 0;
    
    reports.forEach(d => {
        batch.update(d.ref, { jenis_pekerjaan: 'inlet' });
        count++;
    });

    if (count > 0) {
        await batch.commit();
        console.log(`Updated ${count} reports.`);
    } else {
        console.log("No reports needed update.");
    }
    
    process.exit(0);
}
run();
