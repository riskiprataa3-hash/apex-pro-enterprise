const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
signInWithEmailAndPassword(auth, 'riskiprataa3@gmail.com', 'Riski1310').then(c => {
  console.log("SUCCESS:", c.user.uid);
  process.exit(0);
}).catch(e => {
  console.error("FAIL:", e.code);
  process.exit(1);
});
