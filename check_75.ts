import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
    
    let pId = "";
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', 'inlet')));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes("PEKANBARU")) pId = d.id; 
    });
    
    const entriesSnap = await getDocs(collection(db, 'projects', pId, 'entries'));
    const may17Entries = entriesSnap.docs.filter(d => {
        const data = d.data();
        return data.description === "Non-Frame" && data.timestamp > 1700000000000;
    });

    console.log(`Jumlah entry saat ini pada timestamp terbaru: ${may17Entries.length}`);
    process.exit(0);
}

run().catch(console.error);
