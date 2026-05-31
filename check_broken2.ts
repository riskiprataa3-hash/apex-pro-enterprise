import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function c() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    let pid = "TbtZli8c6XY3AGtWjls5"; // Project ID?
    const pdocs = await getDocs(collection(db, 'projects'));
    pdocs.forEach(d => {
        if (d.data().type === 'inlet') pid = d.id;
    });

    const entries = await getDocs(collection(db, 'projects', pid, 'entries'));
    
    let bc = 0;
    entries.forEach(d => {
        const data = d.data();
        let h = false;
        if (data.photos0 && data.photos0[0] && data.photos0[0].includes('projects%2F')) h = true;
        if (data.foto_0 && data.foto_0.includes('projects%2F')) h = true;
        if (h) bc++;
    });
    console.log("Broken entries:", bc);
    process.exit(0);
}
c();
