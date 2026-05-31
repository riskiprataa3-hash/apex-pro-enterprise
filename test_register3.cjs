const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310').then(c => {
  console.log("LOGIN SUCCESS:", c.user.uid);
  process.exit(0);
}).catch(e => {
  if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
      createUserWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310').then(c => {
        console.log("REGISTER SUCCESS:", c.user.uid);
        process.exit(0);
      }).catch(e2 => {
        console.error("FAIL:", e2.code);
        process.exit(1);
      });
  } else {
    console.error("FAIL:", e.code);
    process.exit(1);
  }
});
