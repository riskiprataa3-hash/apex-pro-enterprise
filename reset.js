import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0223554772",
  appId: "1:835767369662:web:56768b2d397027f5ea43ef",
  apiKey: "AIzaSyC67tmukGbI2FmIWp4B47w3S_kw4EDbE6s",
  authDomain: "gen-lang-client-0223554772.firebaseapp.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function sendReset() {
  try {
    await sendPasswordResetEmail(auth, "admin.shaka01@gmail.com");
    console.log("Password reset email sent to admin.shaka01@gmail.com!");
  } catch (err) {
    console.error("Failed to send:", err.message);
  }
  process.exit();
}

sendReset();
