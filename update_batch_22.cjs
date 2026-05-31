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
    console.log("Logged in");
    
    // Find project
    const projects = await getDocs(collection(db, 'projects'));
    let projectId = '';
    projects.forEach(p => {
        if(p.data().name.includes('PEKANBARU-DUMAI')) projectId = p.id;
    });

    const _23MayEpoch = new Date('2026-05-23T00:00:00.000Z').getTime();
    const newTimestamp22May = new Date('2026-05-22T12:00:00.000Z').getTime();

    const entriesRef = collection(db, `projects/${projectId}/entries`);
    const entries = await getDocs(entriesRef);
    
    const currentToday = [];
    for (const en of entries.docs) {
        if (en.data().timestamp > _23MayEpoch) {
            currentToday.push({ id: en.id, km: en.data().km, timestamp: en.data().timestamp });
        }
    }
    
    currentToday.sort((a,b) => a.timestamp - b.timestamp);
    
    // We already know split index is 94
    const firstBatch = currentToday.slice(0, 94);
    const secondBatch = currentToday.slice(94);
    
    console.log(`Will update ${secondBatch.length} items to May 22 (from ${secondBatch[0].timestamp})`);
    
    let updated = 0;
    for(const item of secondBatch) {
        await updateDoc(doc(db, `projects/${projectId}/entries`, item.id), { timestamp: newTimestamp22May });
        updated++;
    }
    
    console.log(`Done updating ${updated} items in entries to May 22!`);
    process.exit(0);
}
run();
