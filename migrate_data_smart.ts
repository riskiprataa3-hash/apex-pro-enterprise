import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc, limit, query, orderBy, startAfter, documentId } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);

const STATE_FILE = './migration_state.json';

type MigrationState = {
  [collectionPath: string]: {
    lastProcessedId: string | null;
    done: boolean;
  }
};

function loadState(): MigrationState {
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  return {};
}

function saveState(state: MigrationState) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function migrate() {
  console.log('--- STARTING SMART MIGRATION (BOUNDED RUN) ---');
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  
  const srcDb = getFirestore(app, 'shaka-prod-v3');
  const destDb = getFirestore(app, 'shaka-v4');

  const state = loadState();

  const collectionsToMigrate = [
    'projects', 'app_settings', 'login_logs', 'tasks', 'chat_messages',
    'notifications', 'inventory', 'hse_logs', 'apd_checks', 'incidents',
    'user_profiles', 'equipment_requests', 'attendance', 'cash_advances',
    'active_sessions', 'inlet_reports'
  ];

  const BATCH_SIZE = 500;
  const RUN_LIMIT = 9999; // basically unlimited
  let batchesRun = 0;

  for (const colName of collectionsToMigrate) {
    if (batchesRun >= RUN_LIMIT) break;
    
    if (!state[colName]) {
      state[colName] = { lastProcessedId: null, done: false };
    }
    
    if (state[colName].done) {
      console.log(`⏩ Skipping ${colName}, already done.`);
      continue;
    }

    console.log(`\n📦 Migrating ${colName}...`);
    
    let hasMore = true;
    while (hasMore && batchesRun < RUN_LIMIT) {
      batchesRun++;
      let q = query(collection(srcDb, colName), orderBy(documentId()), limit(BATCH_SIZE));

      if (state[colName].lastProcessedId) {
        q = query(collection(srcDb, colName), orderBy(documentId()), startAfter(state[colName].lastProcessedId), limit(BATCH_SIZE));
      }

      console.log(`Fetching batch for ${colName} (after: ${state[colName].lastProcessedId || 'start'})...`);
      let snaps;
      try {
        snaps = await getDocs(q);
      } catch (err: any) {
        console.error(`❌ Error fetching ${colName}:`, err.message);
        break;
      }

      if (snaps.empty) {
        console.log(`✅ Finished migrating ${colName}.`);
        state[colName].done = true;
        saveState(state);
        hasMore = false;
        break;
      }

      let count = 0;
      const batchPromises = snaps.docs.map(docSnap => 
        setDoc(doc(destDb, colName, docSnap.id), docSnap.data())
          .then(() => { count++; })
          .catch(e => console.error(`Failed to set ${docSnap.id}:`, e.message))
      );
      
      await Promise.all(batchPromises);
      state[colName].lastProcessedId = snaps.docs[snaps.docs.length - 1].id;
      
      console.log(`  -> Saved ${count} docs`);
      saveState(state);
    }
  }

  // Now handle subcollections
  try {
    const destProjects = await getDocs(collection(destDb, 'projects'));
    for (const p of destProjects.docs) {
      if (batchesRun >= RUN_LIMIT) break;
      const parentId = p.id;
      const subColName = `projects/${parentId}/entries`;
      
      if (!state[subColName]) state[subColName] = { lastProcessedId: null, done: false };
      if (state[subColName].done) continue;
      
      let hasMore = true;
      let entryTotalCount = 0;
      while (hasMore && batchesRun < RUN_LIMIT) {
        batchesRun++;
        let q = query(collection(srcDb, subColName), orderBy(documentId()), limit(BATCH_SIZE));
        if (state[subColName].lastProcessedId) {
          q = query(collection(srcDb, subColName), orderBy(documentId()), startAfter(state[subColName].lastProcessedId), limit(BATCH_SIZE));
        }

        let snaps;
        try { snaps = await getDocs(q); } catch (err: any) { hasMore = false; break; }

        if (snaps.empty) {
          state[subColName].done = true;
          saveState(state);
          hasMore = false;
          if (entryTotalCount > 0) console.log(`✅ Finished ${subColName} (Total: ${entryTotalCount})`);
          break;
        }

        const batchPromises = snaps.docs.map(docSnap => 
          setDoc(doc(destDb, subColName, docSnap.id), docSnap.data()).catch(e => {})
        );
        await Promise.all(batchPromises);
        
        entryTotalCount += snaps.size;
        state[subColName].lastProcessedId = snaps.docs[snaps.docs.length - 1].id;
        saveState(state);
      }
    }
  } catch (err: any) {
    console.error(err);
  }
  
  if (batchesRun < RUN_LIMIT) {
    console.log('--- ALL MIGRATION COMPLETED ---');
  } else {
    console.log('--- REACHED BATCH LIMIT, PLZ RE-RUN ---');
  }
  process.exit(0);
}

migrate();
