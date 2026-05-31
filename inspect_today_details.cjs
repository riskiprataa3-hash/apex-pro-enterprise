const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { readFileSync } = require('fs');

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    
    // Find project
    const projects = await getDocs(collection(db, 'projects'));
    let projectId = '';
    projects.forEach(p => {
        if(p.data().name.includes('PEKANBARU-DUMAI')) projectId = p.id;
    });

    const _23MayEpoch = new Date('2026-05-23T00:00:00.000Z').getTime();

    const entriesRef = collection(db, `projects/${projectId}/entries`);
    const entries = await getDocs(entriesRef);
    
    // The items from 144 today
    const currentToday = [];
    for (const en of entries.docs) {
        if (en.data().timestamp > _23MayEpoch) {
            currentToday.push({ id: en.id, km: en.data().km, timestamp: en.data().timestamp });
        }
    }
    
    // Sort by timestamp
    currentToday.sort((a,b) => a.timestamp - b.timestamp);
    
    console.log(`There are ${currentToday.length} today entries.`);
    console.log(currentToday.slice(0, 5));
    console.log(currentToday.slice(-5));
    
    // So if the first 50 were imported first, they have lower timestamps.
    process.exit(0);
}
run();
