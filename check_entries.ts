import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    console.log("Logged in");
    
    // the project ID is likely 'vDBk22Y3sA4hGzY4c7hG' or something, find it
    const projects = await getDocs(collection(db, 'projects'));
    let projectId = '';
    projects.forEach(p => {
        if(p.data().name.includes('PEKANBARU-DUMAI')) projectId = p.id;
    });

    if(!projectId) return console.log("Not found project");

    const entries = await getDocs(collection(db, `projects/${projectId}/entries`));
    let totalQty = 0;
    let nonArchivedCount = 0;
    let archivedCount = 0;
    entries.forEach(d => {
        const data = d.data();
        if (data.isArchived) {
            archivedCount++;
        } else {
            nonArchivedCount++;
            totalQty += Number(data.qty) || 0;
        }
    });
    console.log("Non-archived count:", nonArchivedCount);
    console.log("Archived count:", archivedCount);
    console.log("Sum of non-archived qty:", totalQty);
    process.exit(0);
}
run();
