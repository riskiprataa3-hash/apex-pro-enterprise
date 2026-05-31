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
    
    const projects = await getDocs(collection(db, 'projects'));
    let projectId = '';
    projects.forEach(p => {
        if(p.data().name.includes('PEKANBARU-DUMAI')) projectId = p.id;
    });

    const _23MayEpoch = new Date('2026-05-23T00:00:00.000Z').getTime();
    const newTimestamp = new Date('2026-05-22T12:00:00.000Z').getTime();

    const entriesRef = collection(db, `projects/${projectId}/entries`);
    const entries = await getDocs(entriesRef);
    
    // We update EXACTLY 50 items which have timestamp > 23MayEpoch, and maybe their km isn't in misdatedKms22? 
    // Let's just find the first 50 items that are likely from 22 Mei.
    // Wait, earlier we found 144 items with timestamp for May 23.
    // We already moved 50 in inlet_reports. 
    // The items in `entries` the 50 items migrated earlier today might not match the `km` in misdatedKms22 exactly because of spaces? (e.g. "21+800 B/OS")
    // Let's print out what we see in `entries` today.
    const todayEntries = [];
    entries.forEach(e => {
        if (e.data().timestamp > _23MayEpoch) {
            todayEntries.push({ id: e.id, km: e.data().km, timestamp: e.data().timestamp });
        }
    });

    console.log(`Found ${todayEntries.length} entries for today (May 23) in the entries col`);

    process.exit(0);
}
run();
