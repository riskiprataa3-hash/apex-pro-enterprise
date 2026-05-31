const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
initializeApp(firebaseConfig);

const bucket = getStorage().bucket("gen-lang-client-0223554772.firebasestorage.app");

async function run() {
    const [files] = await bucket.getFiles({ prefix: 'dokumentasi O%' });
    console.log(`Found ${files.length} files`);
    if (files.length > 0) {
        const file = files[1] || files[0];
        console.log("Name:", file.name);
        const token = file.metadata.metadata?.firebaseStorageDownloadTokens;
        console.log("Token:", token);
        let url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name).replace(/%2F/g, '%2F')}?alt=media`;
        if (token) {
            url += `&token=${token.split(',')[0]}`;
        }
        console.log("URL:", url);
    }
}
run();
