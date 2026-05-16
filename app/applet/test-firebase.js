import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, doc } from "firebase/firestore";
import { readFileSync } from "fs";

const keyPath = process.cwd() + "/firebase-applet-config.json";
const firebaseConfig = JSON.parse(readFileSync(keyPath, "utf-8"));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "blaze-db");

// You can't auth easily from Node with Client SDK to test security rules
// because we don't have the user password readily available without UI auth.
