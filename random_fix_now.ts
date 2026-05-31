import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, getDocs, query, where } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function getUrls(path: string) {
    const rootRef = ref(storage, path);
    const res = await listAll(rootRef);
    const urls: string[] = [];
    for (const item of res.items) {
        urls.push(await getDownloadURL(item));
    }
    return urls;
}

async function run() {
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
    
    console.log("Mengambil daftar gambar dari Storage...");
    const urls0 = await getUrls('dokumentasi O%');
    const urls50 = await getUrls('dokumentasi 5O%');
    const urls100 = await getUrls('dokumentasi 10O%');
    
    let pId = "";
    const pDocs = await getDocs(query(collection(db, 'projects'), where('type', '==', 'inlet')));
    pDocs.forEach(d => { if (d.data().name.toUpperCase().includes("PEKANBARU")) pId = d.id; });
    
    console.log("Membaca entri KM di Firestore...");
    const entriesSnap = await getDocs(query(collection(db, 'projects', pId, 'entries'), where('description', '==', 'Non-Frame')));
    const rawSnap = await getDocs(query(collection(db, 'inlet_reports'), where('keterangan', '==', 'Non-Frame')));
    
    const listKM = [
        "22+400", "22+405", "22+410", "22+415", "22+420", "22+425", "22+430", "22+435", "22+440", "22+445", "22+450", "22+455", "22+460", "22+465", "22+470", "22+475", "22+480", "22+485", "22+490", "22+495", "22+495", "22+500", "22+505", "22+510", "22+515", "22+520", "22+525", "22+530", "22+535", "22+540", "22+545", "22+550", "22+555", "22+560", "22+565", "22+565", "22+570", "22+575", "22+580", "22+585", "22+590", "22+595", "22+600", "22+605", "22+610", "22+615", "22+620", "22+625", "22+630", "22+635", "22+635", "22+640", "22+645", "22+650", "22+655", "22+660", "22+665", "22+670", "22+675", "22+680", "22+685", "22+690", "22+695", "22+700", "22+705", "22+710", "22+715", "22+720", "22+725", "22+730"
    ];
    
    const matchEntries = (docs: any[], getKey: (data: any) => string) => {
        const refs: any[] = [];
        const used = new Set();
        
        for (const km of listKM) {
            let found = docs.find(d => getKey(d.data()) === km && !used.has(d.id));
            if (!found) found = docs.find(d => getKey(d.data()) === km);
            if (found) {
                refs.push(found.ref);
                used.add(found.id);
            }
        }
        return refs;
    };
    
    const orderedRefs = matchEntries(entriesSnap.docs, d => d.km);
    const orderedRawRefs = matchEntries(rawSnap.docs, d => d.lokasi_km);

    let batch = writeBatch(db);
    let opCount = 0;
    
    console.log("Memperbarui foto secara acak ke masing-masing entri...");
    
    for (let i = 0; i < Math.max(orderedRefs.length, orderedRawRefs.length); i++) {
        // Ambil secara acak foto dengan kategori prosentase masing-masing
        const p0 = urls0.length > 0 ? urls0[Math.floor(Math.random() * urls0.length)] : null;
        const p50 = urls50.length > 0 ? urls50[Math.floor(Math.random() * urls50.length)] : null;
        const p100 = urls100.length > 0 ? urls100[Math.floor(Math.random() * urls100.length)] : null;
        
        if (i < orderedRefs.length) {
            batch.update(orderedRefs[i], {
                photos0: p0 ? [p0] : [],
                photos50: p50 ? [p50] : [],
                photos100: p100 ? [p100] : []
            });
            opCount++;
        }
        
        if (i < orderedRawRefs.length) {
            batch.update(orderedRawRefs[i], {
                foto_0: p0,
                foto_50: p50,
                foto_100: p100
            });
            opCount++;
        }

        if (opCount >= 400) {
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
        }
    }
    
    if (opCount > 0) {
        await batch.commit();
    }
    console.log("✅ Berhasil mengacak foto secara menyeluruh, gambar pecah/kosong akan terisi foto secara acak!");
    process.exit(0);
}
run().catch(console.error);
