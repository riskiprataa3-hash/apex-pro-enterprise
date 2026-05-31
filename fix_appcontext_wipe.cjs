const fs = require('fs');
let c = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const code = `
    (window as any).clearIncidentsAndHSE = async () => {
      try {
        console.log("Starting clearance...");
        const incRef = collection(db, 'incidents');
        const snapshotInc = await getDocs(incRef);
        for (const docSnap of snapshotInc.docs) {
          await deleteDoc(docSnap.ref);
        }
        console.log(\`Deleted \${snapshotInc.docs.length} incidents\`);
        
        const hseRef = collection(db, 'hse_logs');
        const snapshotHse = await getDocs(hseRef);
        for (const docSnap of snapshotHse.docs) {
          await deleteDoc(docSnap.ref);
        }
        console.log(\`Deleted \${snapshotHse.docs.length} HSE logs\`);
        alert("Data K3 & Insiden berhasil dikosongkan");
      } catch (err: any) {
        console.error(err);
        alert("Gagal wipe: " + err.message);
      }
    };
`;

if (!c.includes('window.clearIncidentsAndHSE')) {
  c = c.replace(/window\.setAppQuotaExceeded = setQuotaExceeded;/, `${code}\n    window.setAppQuotaExceeded = setQuotaExceeded;`);
  fs.writeFileSync('src/context/AppContext.tsx', c);
  console.log('Added wipe function back to AppContext');
}
