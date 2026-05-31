const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
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

async function fixPhotos() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  console.log("Logged in!");

  const projs = await getDocs(collection(db, 'projects'));
  let updatedCount = 0;

  for (const p of projs.docs) {
    if (p.data().isArchived) continue;
    console.log(`Checking project: ${p.id}`);
    const entries = await getDocs(collection(db, 'projects', p.id, 'entries'));
    
    for (const e of entries.docs) {
      if (e.data().isArchived) continue;
      
      const data = e.data();
      const has0 = data.photos0 && data.photos0.length > 0;
      const has50 = data.photos50 && data.photos50.length > 0;
      const has100 = data.photos100 && data.photos100.length > 0;
      
      if (!has0 || !has50 || !has100) {
        const updates = {};
        if (!has0) updates.photos0 = [randomPhoto()];
        if (!has50) updates.photos50 = [randomPhoto()];
        if (!has100) updates.photos100 = [randomPhoto()];
        
        await updateDoc(doc(db, 'projects', p.id, 'entries', e.id), updates);
        console.log(`Updated entry ${e.id} (${data.km}) - missing docs fixed.`);
        updatedCount++;
      }
    }
  }
  
  console.log(`Done! Fixed documentation for ${updatedCount} entries.`);
}

fixPhotos().then(() => process.exit(0)).catch(console.error);
