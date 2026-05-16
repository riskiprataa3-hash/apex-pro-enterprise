import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from './firebase-applet-config.json';

async function test() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app, "blaze-db");
  
  try {
    console.log('Attempting to write to blaze-db...');
    await setDoc(doc(db, 'test_col', 'test_doc'), { hello: 'world', timestamp: Date.now() });
    console.log('SUCCESS!');
  } catch (e: any) {
    console.error('FAILED:', e.message);
  }
}

test();
