import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function main() {
  const projectsRef = db.collection('projects');
  const snapshot = await projectsRef.where('type', '==', 'inlet').get();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.name && data.name.toUpperCase().includes('PEKANBARU-DUMAI')) {
      console.log('Found Project:', doc.id, data.name);
    }
  });
}

main().catch(console.error);
