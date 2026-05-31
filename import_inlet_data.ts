import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const b_os = [
  "61+420", "61+240", "61+120", "60+945", "60+940", "60+900", "60+880", "60+860", "60+855", "60+845", "60+840", "60+830", "60+795", "60+700", "60+685", "60+680", "60+670", "60+660", "60+620", "60+615", "60+610", "60+605", "60+580", "60+565", "60+560", "60+550", "60+630", "60+635", "60+640", "60+650", "60+655", "60+450", "60+420", "55+610", "55+150", "44+400", "44+370"
];

const a_os = [
  "54+970", "54+975", "54+980", "54+985", "54+990", "55+000", "55+005", "55+010", "55+050", "55+060", "55+300", "55+465", "55+530", "55+555", "55+590", "55+595", "55+630"
];

async function main() {
  const projectsRef = collection(db, 'projects');
  const snapshot = await getDocs(projectsRef);
  
  let targetProjectId = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.type === 'inlet' && data.name && data.name.toUpperCase().includes('PEKANBARU-DUMAI')) {
      targetProjectId = doc.id;
    }
  });

  if (!targetProjectId) {
    console.log("Proj not found!");
    return;
  }
  
  console.log("Project ID:", targetProjectId);

  const timestamp = new Date("2026-05-29T10:00:00Z").getTime();
  const dateDisplay = "29 Mei 2026";
  const dummyPhoto = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/DOKUMENTASI%20FRAME%200%25%2FFR-0-29MEI.jpg?alt=media"; 
  // Should check structure of existing photos
  
  let count = 0;
  
  for (const km of b_os) {
      const entryRef = doc(collection(db, `projects/${targetProjectId}/entries`));
      await setDoc(entryRef, {
        id: entryRef.id,
        projectId: targetProjectId,
        km,
        type: 'inlet',
        arah: 'B/OS',
        status: 'completed',
        timestamp,
        dateDisplay,
        qty: 1,
        photos0: ['https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.appspot.com/o/DOKUMENTASI%20FRAME%200%25%2Fplaceholder.jpg?alt=media'], // we can adjust this
        photos50: [],
        photos100: ['https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.appspot.com/o/DOKUMENTASI%20FRAME%20100%25%2Fplaceholder.jpg?alt=media'],
        lajur: 'B/OS',
        latitude: null, // let's see if this is needed
        longitude: null,
        entryDesc: 'Diinput via Sistem pada 29 Mei 2026'
      });
      console.log(`Inserted ${km} B/OS`);
      count++;
  }
  
  for (const km of a_os) {
      const entryRef = doc(collection(db, `projects/${targetProjectId}/entries`));
      await setDoc(entryRef, {
        id: entryRef.id,
        projectId: targetProjectId,
        km,
        type: 'inlet',
        arah: 'A/OS',
        status: 'completed',
        timestamp,
        dateDisplay,
        qty: 1,
        photos0: ['https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.appspot.com/o/DOKUMENTASI%20FRAME%200%25%2Fplaceholder.jpg?alt=media'], // we can adjust this
        photos50: [],
        photos100: ['https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.appspot.com/o/DOKUMENTASI%20FRAME%20100%25%2Fplaceholder.jpg?alt=media'],
        lajur: 'A/OS',
        latitude: null, // let's see if this is needed
        longitude: null,
        entryDesc: 'Diinput via Sistem pada 29 Mei 2026'
      });
      console.log(`Inserted ${km} A/OS`);
      count++;
  }
  
  console.log("Total inserted:", count);
  process.exit(0);
}

main().catch(console.error);
