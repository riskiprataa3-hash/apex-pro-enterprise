import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: "json" };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "shaka-v4");

async function run() {
  for (let i = 1; i <= 15; i++) {
    const num = i.toString().padStart(2, '0');
    const email = `admin.shaka${num}@gmail.com`;
    const docRef = doc(db, 'workers', email);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log(`[ADDING] ${email}`);
      const idRef = `SHK-ADM-${i.toString().padStart(3, '0')}`;
      await setDoc(docRef, {
        employeeId: idRef,
        name: `ADMIN SHAKA ${num}`,
        email: email,
        password: '02242004',
        role: 'admin',
        dailyRate: 0,
        isPinnedToLogin: true,
        geofenceLimit: null,
        createdAt: Date.now()
      });
    }
  }

  for (let i = 1; i <= 50; i++) {
    const num = i.toString().padStart(2, '0');
    const email = `pelaksana.shaka${num}@gmail.com`;
    const docRef = doc(db, 'workers', email);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      console.log(`[ADDING] ${email}`);
      const idRef = `SHK-PEL-${i.toString().padStart(3, '0')}`;
      await setDoc(docRef, {
        employeeId: idRef,
        name: `PELAKSANA SHAKA ${num}`,
        email: email,
        password: '02242004',
        role: 'field-operator',
        dailyRate: 0,
        isPinnedToLogin: true,
        geofenceLimit: null,
        createdAt: Date.now()
      });
    }
  }
}

run().then(() => {
  console.log('DONE!');
  process.exit(0);
});
