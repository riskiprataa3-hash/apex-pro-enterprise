import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

const FOLDER_0 = 'dokumentasi O%';   
const FOLDER_50 = 'dokumentasi 5O%'; 
const FOLDER_100 = 'dokumentasi 10O%';

async function fetchUrlRefs(folderName: string) {
    const folderRef = ref(storage, folderName);
    const res = await listAll(folderRef);
    return res.items;
}

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

async function fix() {
    await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');
    
    console.log("Fetching images...");
    const items0 = await fetchUrlRefs(FOLDER_0);
    const items50 = await fetchUrlRefs(FOLDER_50);
    const items100 = await fetchUrlRefs(FOLDER_100);
    
    const p0 = shuffleArray(items0);
    const p50 = shuffleArray(items50);
    const p100 = shuffleArray(items100);

    let pid = "";
    const pdocs = await getDocs(collection(db, 'projects'));
    pdocs.forEach(d => {
        if (d.data().type === 'inlet') pid = d.id;
    });

    const entries = await getDocs(collection(db, 'projects', pid, 'entries'));
    
    let batches: any[] = [];
    let currentBatch = writeBatch(db);
    let opCount = 0;
    
    let idx0 = 0, idx50 = 0, idx100 = 0;

    for (const d of entries.docs) {
        const data = d.data();
        let h = false;
        
        if (!data.photos0 || data.photos0.length === 0 || (data.photos0[0] && data.photos0[0].includes('projects%2F'))) h = true;
        if (data.foto_0 && data.foto_0.includes('projects%2F')) h = true;
        if (!data.foto_0) h = true;
        
        if (h) {
            const i0 = p0[idx0++ % p0.length];
            const i50 = p50[idx50++ % p50.length];
            const i100 = p100[idx100++ % p100.length];
            
            // fetch URLs only when needed in batch is faster but wait, making 300 network requests in sequence is what timed it out!
            // Let's do Promise.all!
            const [url0, url50, url100] = await Promise.all([
                getDownloadURL(i0),
                getDownloadURL(i50),
                getDownloadURL(i100)
            ]);
            
            const updates: any = {};
            updates.photos0 = [url0]; updates.foto_0 = url0;
            updates.photos50 = [url50]; updates.foto_50 = url50;
            updates.photos100 = [url100]; updates.foto_100 = url100;
            
            currentBatch.update(d.ref, updates);
            opCount++;
            
            if (opCount === 400) {
                batches.push(currentBatch);
                currentBatch = writeBatch(db);
                opCount = 0;
            }
        }
    }
    
    if (opCount > 0) batches.push(currentBatch);
    console.log(`Updating ${opCount} docs in ${batches.length} batches...`);
    for (const b of batches) await b.commit();
    console.log("Fixed broken images.");
    process.exit(0);
}
fix();
