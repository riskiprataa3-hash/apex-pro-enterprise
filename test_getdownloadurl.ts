import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function testUrl() {
    try {
        const url = await getDownloadURL(ref(storage, "gs://gen-lang-client-0223554772.firebasestorage.app/dokumentasi 10O%/IMG_20260515_150856_747.jpg"));
        console.log("Success:", url);
    } catch(e) {
        console.error(e);
    }
}
testUrl();
