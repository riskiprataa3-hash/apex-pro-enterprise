const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const photos = [
  "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/projects%2FTbtZli8c6XY3AGtWjls5%2F0%2F1778778163411_37693.jpeg?alt=media&token=5967bd2a-1f63-4c67-99cc-ba4db0a2b6e8",
  "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/dokumentasi%20O%25%2FIMG_20260517_085402_330_800x800.jpeg?alt=media&token=89786bce-d2a2-43cd-bec0-f1676d858c3d",
  "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/dokumentasi%20O%25%2FIMG_20260515_094218_499.jpg?alt=media&token=42f0f6e5-9484-4fcc-9bfd-e7b8b40eaa72",
  "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/projects%2FTbtZli8c6XY3AGtWjls5%2F100%2F1778778191383_37453.jpeg?alt=media&token=6b6746a1-c04d-421a-88c0-12ca5d52fd5f",
  "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/projects%2FTbtZli8c6XY3AGtWjls5%2F50%2F1778778172749_37668.jpeg?alt=media&token=474e5a72-8502-4d94-bca3-2efd6a233ded"
];

function randomPhoto() {
  return photos[Math.floor(Math.random() * photos.length)];
}

const datesToPopulate = [
  {
    date: '2026-05-13T12:00:00+07:00', // May 13
    count: 1
  },
  {
    date: '2026-05-14T12:00:00+07:00', // May 14
    count: 1
  },
  {
    date: '2026-05-15T12:00:00+07:00', // May 15
    count: 53
  }
];

let kmCounter = 100;

async function run() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  console.log("Logged in!");
  
  const pId = 'TbtZli8c6XY3AGtWjls5';
  
  for (const group of datesToPopulate) {
    const baseDate = new Date(group.date);
    console.log(`Generating ${group.count} entries for ${baseDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta'})}...`);
    
    for (let i = 0; i < group.count; i++) {
        // distribute timestamp across the day slightly
        const t = baseDate.getTime() + (i * 60 * 1000); 
        const side = Math.random() > 0.5 ? 'A' : 'B';
        const kmVal = `21+${String(kmCounter++).padStart(3, '0')} ${side}`;
        
        const data = {
            km: kmVal,
            isArchived: false,
            status: "completed",
            qty: 1,
            photos100: [randomPhoto()],
            description: "(NON FRAME)",
            photos50: [randomPhoto()],
            ownerId: "WrCNVgmEWfOKDIAABbefVDR9whH3",
            photos0: [randomPhoto()],
            signType: "37x24",
            timestamp: t,
            // system fields sometimes used
            type: "inlet",
            createdDay: new Date(t).toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta"}),
            serverTimestamp: new Date(t)
        };

        try {
            const docRef = await addDoc(collection(db, "projects", pId, "entries"), data);
            console.log(`[BERHASIL] Entri ${data.km} terinput. ID: ${docRef.id}`);
        } catch (e) {
            console.error(`[GAGAL] ${data.km}: ${e.message}`);
        }
    }
  }
  
  console.log("Done inserting missing records.");
}

run().then(() => process.exit(0)).catch(console.error);
