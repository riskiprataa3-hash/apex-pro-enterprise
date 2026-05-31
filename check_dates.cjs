const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
  console.log("Logged in!");
  const projs = await getDocs(collection(db, 'projects'));
  
  for (const p of projs.docs) {
    if(p.data().isArchived) continue;
    console.log(`\nProject: ${p.id} - ${p.data().name} (${p.data().type})`);
    
    // entries
    const entries = await getDocs(collection(db, 'projects', p.id, 'entries'));
    
    const counts = {};
    for (const e of entries.docs) {
      if(e.data().isArchived) continue;
      
      const t = e.data().timestamp;
      if(!t) continue;
      
      const d = new Date(t);
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      counts[k] = (counts[k] || 0) + 1;
    }
    
    console.log("Entry counts per date:");
    Object.keys(counts).sort().forEach(k => {
      console.log(`  ${k}: ${counts[k]} entries`);
    });
  }
}
check().then(() => process.exit(0)).catch(console.error);
