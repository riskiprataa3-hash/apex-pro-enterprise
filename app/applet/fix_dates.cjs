const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { readFileSync, writeFileSync } = require('fs');

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

    if(!projectId) return console.log("Project not found");

    const reportsRef = collection(db, 'inlet_reports');
    const reports = await getDocs(reportsRef);
    
    const misdatedKms22 = [];
    const _23MayEpoch = new Date('2026-05-23T00:00:00.000Z').getTime();

    // The timestamp we want to set it to (22 May, middle of the day)
    const newTimestamp = new Date('2026-05-22T12:00:00.000Z').getTime();

    for (const d of reports.docs) {
        const data = d.data();
        if (data.tanggal === '22 Mei 2026' || data.tanggal === '22 Mei 2026 ') {
            if (data.timestamp > _23MayEpoch) {
                misdatedKms22.push({ km: data.km, refId: d.id });
                // We'll update inlet_reports immediately
                await updateDoc(doc(db, 'inlet_reports', d.id), { timestamp: newTimestamp });
            }
        }
    }

    console.log(`Found and updated ${misdatedKms22.length} misdated points in inlet_reports for 22 May`);
    
    // Now update in entries array
    const entriesRef = collection(db, `projects/${projectId}/entries`);
    const entries = await getDocs(entriesRef);
    
    let updatedEntries = 0;
    const kmsToFind = misdatedKms22.map(x => x.km);

    for (const en of entries.docs) {
        const data = en.data();
        if (kmsToFind.includes(data.km) && data.timestamp > _23MayEpoch) {
            await updateDoc(doc(db, `projects/${projectId}/entries`, en.id), { timestamp: newTimestamp });
            updatedEntries++;
        }
    }

    console.log(`Updated ${updatedEntries} misdated points in entries collection`);

    process.exit(0);
}
run();
