const admin = require('firebase-admin');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

admin.initializeApp({
  projectId: config.projectId,
});

async function run() {
  const bucket = admin.storage().bucket(`gs://${config.projectId}.firebasestorage.app`);
  const [files] = await bucket.getFiles({ prefix: 'projects/' });
  
  if (files.length > 0) {
    const file = files[0];
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
    console.log("Real URL:", url);
    const proxyUrl = "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&w=640&h=480&fit=inside&output=jpg&q=60";
    console.log("Proxy: ", proxyUrl);
    
    try {
        const res = await fetch(proxyUrl);
        console.log("Response OK?", res.ok, res.status);
    } catch(e) {
        console.error("fetch failed", e);
    }
    
    const proxy2 = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
    try {
        const res2 = await fetch(proxy2);
        console.log("AllOrigins OK?", res2.ok, res2.status);
    } catch (e) {
        console.error(e)
    }

  } else {
    console.log("No files found");
  }
}
run();
