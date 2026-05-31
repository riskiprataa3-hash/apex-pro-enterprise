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

    const reportsRef = collection(db, 'inlet_reports');
    const reports = await getDocs(reportsRef);
    
    const kms22 = [];
    for (const d of reports.docs) {
        const data = d.data();
        if (data.tanggal === '22 Mei 2026' || data.tanggal === '22 Mei 2026 ') {
            kms22.push(data.km);
        }
    }

    console.log(`Found ${kms22.length} points for 22 May in inlet_reports`);

    const _23MayEpoch = new Date('2026-05-23T00:00:00.000Z').getTime();
    const newTimestamp = new Date('2026-05-22T12:00:00.000Z').getTime();

    const entriesRef = collection(db, `projects/${projectId}/entries`);
    const entries = await getDocs(entriesRef);
    
    let updatedEntries = 0;

    for (const en of entries.docs) {
        const data = en.data();
        if (data.timestamp > _23MayEpoch) {
            // It's one of the 144. Does its km match any from 22 May?
            if (kms22.includes(data.km)) {
                await updateDoc(doc(db, `projects/${projectId}/entries`, en.id), { timestamp: newTimestamp });
                updatedEntries++;
            }
        }
    }

    console.log(`Updated ${updatedEntries} misdated points in entries collection to 22 May (out of 144)`);
    process.exit(0);
}
run();
