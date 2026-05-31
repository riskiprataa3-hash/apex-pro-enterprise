const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const { getStorage, ref, listAll, getDownloadURL } = require('firebase/storage');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);
const storage = getStorage(app);

function randomItem(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
    console.log("Fetching images from storage...");
    
    const getFolderUrls = async (folderName) => {
        try {
            const folderRef = ref(storage, folderName);
            const res = await listAll(folderRef);
            return await Promise.all(res.items.map(i => getDownloadURL(i)));
        } catch (e) {
            console.error("Failed to load folder", folderName, e);
            return [];
        }
    };

    const photos0 = await getFolderUrls('DOKUMENTASI FRAME 0%');
    const photos50 = await getFolderUrls('DOKUMENTASI FRAME 50%');
    const photos100 = await getFolderUrls('DOKUMENTASI FRAME 100%');

    if (photos0.length === 0 || photos50.length === 0 || photos100.length === 0) {
        console.error("Missing photos in one of the folders! Aborting.", { 
            "0": photos0.length, "50": photos50.length, "100": photos100.length 
        });
        return process.exit(1);
    }
    
    console.log(`Found ${photos0.length} photos for 0%, ${photos50.length} for 50%, ${photos100.length} for 100%`);

    console.log("Fetching A/OS entries for today (May 28)...");
    const projSnap = await getDocs(collection(db, 'projects'));
    
    let updateCount = 0;
    
    for (const proj of projSnap.docs) {
        const entriesSnap = await getDocs(collection(db, 'projects', proj.id, 'entries'));
        const today = new Date('2026-05-28');
        
        for (const edoc of entriesSnap.docs) {
            const data = edoc.data();
            if (data.lane === 'A/OS') {
                const date = new Date(data.timestamp || Date.now());
                if (date.getDate() === 28 && date.getMonth() === 4 && date.getFullYear() === 2026) {
                    // Update this doc
                    const p0 = randomItem(photos0);
                    const p50 = randomItem(photos50);
                    const p100 = randomItem(photos100);
                    
                    await updateDoc(doc(db, 'projects', proj.id, 'entries', edoc.id), {
                        photo0: p0,
                        photo50: p50,
                        photo100: p100
                    });
                    
                    updateCount++;
                    console.log(`Updated doc ${edoc.id} (KM ${data.km})`);
                }
            }
        }
    }

    console.log(`Successfully updated ${updateCount} entries.`);
    process.exit(0);
}

run();
