import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function check() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', 'inlet')));
    let pId = "";
    pDocs.forEach(d => {
       const pd = d.data();
       if (pd.name && pd.name.toUpperCase().includes('PEKANBARU-DUMAI')) pId = d.id;
    });

    if (!pId) return;

    const snapshot = await getDocs(collection(db, 'projects', pId, 'entries'));
    
    let toDelete = [];
    let count = 0;
    
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.dateDisplay === "30 Mei 2026" || 
            (data.timestamp && new Date(data.timestamp).toISOString().includes("2026-05-30"))) {
            console.log(doc.id, data.dateDisplay, data.km, data.timestamp);
            toDelete.push(doc.id);
            count++;
        }
    });
    
    console.log("Total entries on 30 Mei:", count);
    
    // Only keeping the expected 2 entries
    const expectedKms = ["74+810", "74+805"];
    let keptCount = 0;
    
    for (const [index, id] of toDelete.entries()) {
        const d = snapshot.docs.find(doc => doc.id === id)!.data();
        if (expectedKms.includes(d.km)) {
            console.log("Keeping:", id, d.km);
            expectedKms.splice(expectedKms.indexOf(d.km), 1);
            keptCount++;
        } else {
            console.log("Deleting:", id, d.km);
            await deleteDoc(doc(db, 'projects', pId, 'entries', id));
        }
    }
    
    console.log("Cleanup complete!");
    process.exit(0);
}

check();
