import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const JSONconfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, "shaka-v4");

async function run() {
    await signInWithEmailAndPassword(auth, "adminshaka01@gmail.com", "Riski1310");
    console.log("Logged in");

    const targetTimestamp = new Date("2026-05-22T12:00:00.000Z").getTime();

    // 1. Delete from inlet_reports
    const reportsRef = collection(db, "inlet_reports");
    const reports = await getDocs(reportsRef);
    let deletedReports = 0;

    for (const r of reports.docs) {
        if (r.data().timestamp === targetTimestamp) {
            await deleteDoc(doc(db, "inlet_reports", r.id));
            deletedReports++;
        }
    }
    console.log(`Deleted ${deletedReports} extra reports from inlet_reports.`);

    // 2. Delete from entries
    const projects = await getDocs(collection(db, "projects"));
    let projectId = "";
    projects.forEach(p => {
        if (p.data().name.includes("PEKANBARU-DUMAI")) projectId = p.id;
    });

    if (!projectId) {
        console.log("Project not found");
        process.exit(1);
    }

    const entriesRef = collection(db, `projects/${projectId}/entries`);
    const entries = await getDocs(entriesRef);
    let deletedEntries = 0;

    for (const e of entries.docs) {
        if (e.data().timestamp === targetTimestamp) {
            await deleteDoc(doc(db, `projects/${projectId}/entries`, e.id));
            deletedEntries++;
        }
    }
    console.log(`Deleted ${deletedEntries} extra entries from entries collection.`);

    process.exit(0);
}

run();
