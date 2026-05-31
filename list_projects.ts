import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, writeBatch, getDocs, setDoc, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    
    console.log("Logged in");
    const pDocs = await getDocs(query(collection(db, 'projects')));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes('PEKANBARU-DUMAI')) {
            console.log(d.id, d.data().name, d.data().type, new Date(d.data().createdAt).toISOString());
        }
    });
    process.exit(0);
}
run();
