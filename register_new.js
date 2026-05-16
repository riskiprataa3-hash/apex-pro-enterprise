import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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
  const email = "adminshaka01@gmail.com";
  const pass = "Riski1310";
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    console.log("Success! Created", cred.user.email);
    
    await setDoc(doc(db, 'workers', 'ADMIN-01'), {
      employeeId: 'ADMIN-01',
      name: 'ADMIN SHAKA 01',
      email: 'admin.shaka01@gmail.com', // Keep original in DB for mapping
      password: pass,
      role: 'admin',
      dailyRate: 0,
      isPinnedToLogin: true,
    }, { merge: true });
    
  } catch(e) {
    console.error(e.message);
  }
  process.exit();
}
register();
