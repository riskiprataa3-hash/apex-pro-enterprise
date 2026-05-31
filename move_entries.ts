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
    const sourceId = 'RD0EbL7pn1BvJI66aP8B';
    const destId = 'TbtZli8c6XY3AGtWjls5';

    const sourceEntries = await getDocs(collection(db, 'projects', sourceId, 'entries'));
    
    let batch = writeBatch(db);
    let count = 0;
    
    console.log(`Found ${sourceEntries.size} entries to move`);
    
    sourceEntries.forEach(d => {
        const data = d.data();
        const newRef = doc(collection(db, 'projects', destId, 'entries'));
        batch.set(newRef, data);
        batch.delete(d.ref);
        count += 2;
    });

    if (count > 0) {
        await batch.commit();
        console.log("Moved entries.");
    }
    
    await deleteDoc(doc(db, 'projects', sourceId));
    console.log("Deleted source project.");
    
    process.exit(0);
}
run();
