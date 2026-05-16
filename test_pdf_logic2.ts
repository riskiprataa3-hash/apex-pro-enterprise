import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { readFileSync } from 'fs';

const JSONconfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(JSONconfig);
const auth = getAuth(app);
const db = getFirestore(app, 'shaka-v4');

async function testPdf() {
  await signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310');
  
  const projectId = 'TbtZli8c6XY3AGtWjls5';
  const snaps = await getDocs(collection(db, 'projects', projectId, 'entries'));
  
  const entries: any[] = [];
  snaps.forEach(d => entries.push({ id: d.id, ...d.data() }));

  const groupsForExport = [{ date: '13 Mei 2026', entries }];

  const loadedImages: Record<string, string> = {};
  const urlsToLoad = new Set<string>();
  groupsForExport.forEach(g => {
    g.entries.forEach(e => {
      if (e.photos0?.[0]) urlsToLoad.add(e.photos0[0]);
      if (e.photos50?.[0]) urlsToLoad.add(e.photos50[0]);
      if (e.photos100?.[0]) urlsToLoad.add(e.photos100[0]);
    });
  });
  
  console.log(`Need to load ${urlsToLoad.size} URLs.`);
  const urlArray = Array.from(urlsToLoad);
  
  const preloadImageAsBase64 = async (url: string): Promise<string | null> => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;
    
    // Use wsrv.nl proxy with width=300 to reduce size
    const proxyUrl = "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&w=300";
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn('Failed proxy:', url);
      return null;
    }
  };

  const start = Date.now();
  for (let i = 0; i < urlArray.length; i += 10) {
    const chunk = urlArray.slice(i, i + 10);
    await Promise.all(chunk.map(async (url) => {
      const b64 = await preloadImageAsBase64(url);
      if (b64) loadedImages[url] = b64;
    }));
    console.log(`Loaded ${Math.min(i+10, urlArray.length)}/${urlArray.length}`);
  }
  const end = Date.now();
  console.log(`Finished loading in ${end - start}ms`);
  
  process.exit(0);
}

testPdf().catch(console.error);
