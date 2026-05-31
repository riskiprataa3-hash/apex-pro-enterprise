import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = JSONconfig.firestoreDatabaseId 
    ? getFirestore(app, JSONconfig.firestoreDatabaseId) 
    : getFirestore(app);

async function run() {
    await signInWithEmailAndPassword(auth, 'pelaksana.shaka@gmail.com', '089519451234');
    console.log("Logged in");

    let batch = writeBatch(db);
    let count = 0;

    // Delete from projects -> entries
    const pId = 'TbtZli8c6XY3AGtWjls5';
    const entriesRef = collection(db, 'projects', pId, 'entries');
    const qEntries = query(entriesRef, where('date', '==', '2026-05-21'));
    const entryDocs = await getDocs(qEntries);

    console.log(`Found ${entryDocs.size} entries for 2026-05-21`);
    entryDocs.forEach(d => {
        batch.delete(d.ref);
        count++;
    });

    // Delete from inlet_reports
    const reportsRef = collection(db, 'inlet_reports');
    const qReports = query(reportsRef, where('tanggal', '==', '21 Mei 2026'));
    const reportDocs = await getDocs(qReports);

    console.log(`Found ${reportDocs.size} inlet_reports for 21 Mei 2026`);
    reportDocs.forEach(d => {
        batch.delete(d.ref);
        count++;
    });

    if (count > 0) {
        await batch.commit();
        console.log(`Deleted ${count} documents associated with May 21st.`);
    } else {
        console.log("No documents found to delete.");
    }

    process.exit(0);
}

run().catch(console.error);
