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
    const counts: Record<string, number> = {};
    entries.forEach(d => {
        const timestamp = d.data().timestamp;
        const dateObj = new Date(timestamp);
        const dStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
        counts[dStr] = (counts[dStr] || 0) + 1;
    });
    console.log("Entries by date:", counts);
    process.exit(0);
}
run();
