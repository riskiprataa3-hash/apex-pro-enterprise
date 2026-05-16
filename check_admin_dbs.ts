import { default as admin } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: config.projectId
});

const defaultDb = getFirestore(app);
const v4Db = getFirestore(app, 'shaka-v4');
const v3Db = getFirestore(app, 'shaka-prod-v3');

async function check() {
  try {
    const defaultSnap = await defaultDb.collection('projects').limit(1).get();
    console.log('default works', defaultSnap.size);
  } catch(e:any) { console.error('default failed', e.message); }

  try {
    const v4Snap = await v4Db.collection('projects').limit(1).get();
    console.log('v4 works', v4Snap.size);
  } catch(e:any) { console.error('v4 failed', e.message); }

  try {
    const v3Snap = await v3Db.collection('projects').limit(1).get();
    console.log('v3 works', v3Snap.size);
  } catch(e:any) { console.error('v3 failed', e.message); }
}

check();
