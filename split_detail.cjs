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
    
    const currentToday = [];
    for (const en of entries.docs) {
        if (en.data().timestamp > _23MayEpoch) {
            currentToday.push({ id: en.id, km: en.data().km, timestamp: en.data().timestamp });
        }
    }
    
    currentToday.sort((a,b) => a.timestamp - b.timestamp);
    
    // Let's find out how many are in the first batch vs second batch
    let splitIdx = 0;
    for(let i = 1; i < currentToday.length; i++) {
        if (currentToday[i].timestamp - currentToday[i-1].timestamp > 1000 * 60) {
            splitIdx = i;
            break;
        }
    }

    console.log(`Split at index ${splitIdx}`);
    if (splitIdx > 0) {
        console.log(`First batch size: ${splitIdx}`);
        console.log(`Second batch size: ${currentToday.length - splitIdx}`);
        
        const firstBatch = currentToday.slice(0, splitIdx);
        const secondBatch = currentToday.slice(splitIdx);
        
        // Which one is size 50 and which is size 94?
        // Let's print sizes!
    } else {
        console.log("No split found!");
    }

    process.exit(0);
}
run();
