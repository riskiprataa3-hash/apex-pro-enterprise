import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll } from "firebase/storage";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const storage = getStorage(app, "gs://gen-lang-client-0223554772.firebasestorage.app");

async function listFiles() {
  const listRef = ref(storage, 'dokumentasi 10O%');
  try {
    const res = await listAll(listRef);
    console.log("Items in dokumentasi 10O%:");
    res.items.forEach((itemRef) => {
      console.log("File:", itemRef.fullPath);
    });
  } catch (error) {
    console.error(error);
  }
}
listFiles();
