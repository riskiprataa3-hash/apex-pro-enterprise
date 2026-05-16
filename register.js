import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "shaka-prod-v3");

async function register() {
  const users = [
    { email: "admin.shaka01@gmail.com", pass: "Riski1310", role: "admin", name: "ADMIN SHAKA 01", empId: "ADMIN-01" },
    { email: "developmentshaka@gmail.com", pass: "Riski1310", role: "admin", name: "DEV SHAKA", empId: "ADMIN-DEV" },
    { email: "pelaksana.shaka@gmail.com", pass: "089519451234", role: "field-operator", name: "PELAKSANA SHAKA", empId: "EMP-PEL-001" }
  ];

  for (const u of users) {
    try {
      console.log(`Registering ${u.email}...`);
      await createUserWithEmailAndPassword(auth, u.email, u.pass);
      console.log(`Successfully created Auth for ${u.email}`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`${u.email} already exists. Attempting to sign in to verify credentials...`);
        try {
           await signInWithEmailAndPassword(auth, u.email, u.pass);
           console.log(`${u.email} password matches!`);
        } catch (loginErr) {
           console.log(`${u.email} login failed: ${loginErr.message}`);
           console.log(`Cannot reset password directly using web SDK without current password. User must reset manually via email or admin console.`);
        }
      } else {
        console.error(`Failed to register ${u.email}:`, err.message);
      }
    }

    try {
      const qRef = doc(db, 'workers', u.empId);
      await setDoc(qRef, {
        employeeId: u.empId,
        name: u.name,
        email: u.email,
        password: u.pass,
        role: u.role,
        dailyRate: 0,
        isPinnedToLogin: true,
      }, { merge: true });
      console.log(`Successfully upserted worker record for ${u.email}`);
    } catch (err) {
      console.error(`Failed to create worker record for ${u.email}:`, err.message);
    }
  }
  process.exit();
}

register();
