import { default as admin } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: config.projectId
});

const newDb = getFirestore(app, "shaka-prod-v3");

async function run() {
   try {
      console.log('Writing to newDb...');
      await newDb.collection('test_admin_write').doc('1').set({ test: true });
      console.log('NewDb write success');
      const snap = await newDb.collection('test_admin_write').get();
      console.log('NewDb read success, size:', snap.size);
   } catch(e: any) {
      console.log('NewDb test failed:', e.message);
   }
}

run();
