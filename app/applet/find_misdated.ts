import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync, writeFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    console.log("Logged in");
    
    const reports = await getDocs(collection(db, 'inlet_reports'));
    
    // Find points manually inserted for 22 Mei, which have timestamp on 23 Mei
    const misdatedKms22: string[] = [];
    const _23MayEpoch = new Date('2026-05-23T00:00:00.000Z').getTime();

    reports.forEach(d => {
        const data = d.data();
        if (data.tanggal === '22 Mei 2026' || data.tanggal === '22 Mei 2026 ') {
            if (data.timestamp > _23MayEpoch) {
                misdatedKms22.push(data.km);
            }
        }
    });

    console.log(`Found ${misdatedKms22.length} misdated points for 22 May`);
    writeFileSync('misdated.json', JSON.stringify(misdatedKms22, null, 2));
    process.exit(0);
}
run();
