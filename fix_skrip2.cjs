const fs = require('fs');
let txt = fs.readFileSync('SKRIP_INLET_PEKANBARU_DUMAI.ts', 'utf8');
txt = txt.replace(/\/\/ await signInWithEmailAndPassword[^;]+;/, "await signInWithEmailAndPassword(auth, 'adminshaka01@gmail.com', 'Riski1310');");
txt = txt.replace(/"system"/g, "auth.currentUser!.uid");
fs.writeFileSync('SKRIP_INLET_PEKANBARU_DUMAI.ts', txt);
