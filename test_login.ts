import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);

async function test() {
   console.log("Before sign in");
   await signInWithEmailAndPassword(auth, 'pelaksana.shaka@gmail.com', '089519451234');
   console.log("After sign in");
   process.exit(0);
}
test();
