import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, writeBatch, limit, query } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import fs from 'fs';

async function migrate() {
  console.log('--- STARTING MIGRATION ---');
  console.log('Source: shaka-prod-v3');
  console.log(`Destination: ${firebaseConfig.firestoreDatabaseId}`);

  const app = initializeApp(firebaseConfig);
  const srcDb = getFirestore(app, 'shaka-prod-v3');
  const destDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

  console.log(`Destination DB ID: ${firebaseConfig.firestoreDatabaseId}`);

  const collectionsToMigrate = [
    'projects', 'app_settings', 'login_logs', 'tasks', 'chat_messages',
    'notifications', 'inventory', 'hse_logs', 'apd_checks', 'incidents',
    'user_profiles', 'equipment_requests', 'attendance', 'cash_advances',
    'active_sessions', 'inlet_reports'
  ];

  for (const colName of collectionsToMigrate) {
    try {
      console.log(`Migrating collection: ${colName}...`);
      const snapshot = await getDocs(collection(srcDb, colName));
      console.log(`Found ${snapshot.size} documents in ${colName}`);
      
      let count = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        try {
          await setDoc(doc(destDb, colName, docSnap.id), data);
          count++;
          if (count % 10 === 0) console.log(`  Processed ${count} docs in ${colName}...`);
        } catch (e: any) {
          console.error(`  Failed to set doc ${docSnap.id} in ${colName}:`, e.message);
        }

        // Special handling for projects/{projectId}/entries
        if (colName === 'projects') {
          const projectId = docSnap.id;
          const entriesSnap = await getDocs(collection(srcDb, `projects/${projectId}/entries`));
          if (!entriesSnap.empty) {
            console.log(`    Migrating ${entriesSnap.size} entries for project ${projectId}...`);
            let entryCount = 0;
            for (const entryDoc of entriesSnap.docs) {
              try {
                await setDoc(doc(destDb, `projects/${projectId}/entries`, entryDoc.id), entryDoc.data());
                entryCount++;
                if (entryCount % 10 === 0) console.log(`      Migrated ${entryCount} entries...`);
              } catch (e: any) {
                console.error(`      Failed to migrate entry ${entryDoc.id}:`, e.message);
              }
            }
          }
        }
      }
      console.log(`Finished migrating ${colName}.`);
    } catch (err: any) {
      console.error(`Error migrating ${colName}:`, err.message);
    }
  }

  console.log('--- MIGRATION COMPLETED ---');
  process.exit(0);
}

migrate();
