import { default as admin } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: config.projectId
});

const defaultDb = getFirestore(app);

async function run() {
   try {
      console.log('Writing to defaultDb...');
      await defaultDb.collection('test_admin_write').doc('1').set({ test: true });
      console.log('DefaultDb write success');
   } catch(e: any) {
      console.log('DefaultDb test failed:', e.message);
   }
}

run();
