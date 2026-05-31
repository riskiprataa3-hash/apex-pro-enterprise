import { db } from './src/firebase';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

(async () => {
  const s = await getDocs(collection(db, 'inlet_reports'));
  const counts: Record<string, number> = {};
  
  s.forEach(d => {
    const data = d.data();
    counts[data.tanggal] = (counts[data.tanggal] || 0) + 1;
  });
  console.log('inlet_reports counts:', counts);
  process.exit(0);
})();
