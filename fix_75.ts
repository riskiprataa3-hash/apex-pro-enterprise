import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function run() {
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
    
    let pId = "";
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', 'inlet')));
    pDocs.forEach(d => { 
        if (d.data().name.toUpperCase().includes("PEKANBARU")) pId = d.id; 
    });
    
    if (!pId) return;
    
    // Get all entries
    const entriesSnap = await getDocs(collection(db, 'projects', pId, 'entries'));
    const may17Entries = entriesSnap.docs.filter(d => {
        const data = d.data();
        return data.description === "Non-Frame" && data.timestamp > 1700000000000;
    });

    const listKM = [
        "22+400", "22+405", "22+410", "22+415", "22+420", "22+425", "22+430", "22+435", "22+440", "22+445", "22+450", "22+455", "22+460", "22+465", "22+470", "22+475", "22+480", "22+485", "22+490", "22+495", "22+495", "22+500", "22+505", "22+510", "22+515", "22+520", "22+525", "22+530", "22+535", "22+540", "22+545", "22+550", "22+555", "22+560", "22+565", "22+565", "22+570", "22+575", "22+580", "22+585", "22+590", "22+595", "22+600", "22+605", "22+610", "22+615", "22+620", "22+625", "22+630", "22+635", "22+635", "22+640", "22+645", "22+650", "22+655", "22+660", "22+665", "22+670", "22+675", "22+680", "22+685", "22+690", "22+695", "22+700", "22+705", "22+710", "22+715", "22+720", "22+725", "22+730"
    ];

    const expectedCount: any = {};
    for(const km of listKM) {
        expectedCount[km] = (expectedCount[km] || 0) + 1;
    }
    
    // Group entries
    const group: any = {};
    for (const entry of may17Entries) {
        const km = entry.data().km;
        if (!group[km]) group[km] = [];
        group[km].push(entry);
    }
    
    // Sort so newest are first
    for (const km in group) {
        group[km].sort((a: any, b: any) => b.data().timestamp - a.data().timestamp);
    }
    
    let toDelete = [];
    for (const km in group) {
        const expected = expectedCount[km] || 0;
        const items = group[km];
        if (items.length > expected) {
            const extra = items.slice(0, items.length - expected);
            toDelete.push(...extra);
        }
    }
    
    const batch = writeBatch(db);
    for (const d of toDelete) {
        batch.delete(d.ref);
    }
    
    // Also cleanup raw reports
    const rawSnap = await getDocs(collection(db, 'inlet_reports'));
    const may17Raw = rawSnap.docs.filter(d => d.data().keterangan === 'Non-Frame' && d.data().timestamp > 1700000000000);
    const rawGroup: any = {};
    for (const raw of may17Raw) {
        const km = raw.data().lokasi_km;
        if (!rawGroup[km]) rawGroup[km] = [];
        rawGroup[km].push(raw);
    }
    for (const km in rawGroup) {
        rawGroup[km].sort((a: any, b: any) => b.data().timestamp - a.data().timestamp);
    }
    
    let toDeleteRaw = [];
    for (const km in rawGroup) {
        const expected = expectedCount[km] || 0;
        const items = rawGroup[km];
        if (items.length > expected) {
            const extra = items.slice(0, items.length - expected);
            toDeleteRaw.push(...extra);
        }
    }
    
    for (const d of toDeleteRaw) {
        batch.delete(d.ref);
    }
    
    await batch.commit();
    console.log(`Berhasil menghapus ${toDelete.length} data ganda (dari percobaan run script tambahan).`);
    process.exit(0);
}

run().catch(console.error);
