import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

async function testOne(dbId: string | undefined) {
  const app = initializeApp(firebaseConfig);
  const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
  const label = dbId || '(default)';
  
  try {
    console.log(`Testing ${label}...`);
    await setDoc(doc(db, 'test_col', 'test_doc'), { hello: 'world', timestamp: Date.now() });
    console.log(`  SUCCESS for ${label}`);
  } catch (e: any) {
    console.log(`  FAILED for ${label}: ${e.message}`);
  }
}

const dbArg = process.argv[2];
testOne(dbArg === 'default' ? undefined : dbArg);
