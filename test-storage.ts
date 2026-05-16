import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString } from "firebase/storage";
import { readFileSync } from "fs";

const config = JSON.parse(readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const storage = getStorage(app, config.storageBucket);
const testRef = ref(storage, "test.txt");

uploadString(testRef, "hello world")
  .then(() => {
    console.log("SUCCESS_STORAGE");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAIL_STORAGE", err.message);
    process.exit(1);
  });
