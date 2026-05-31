const fs = require('fs');
let txt = fs.readFileSync('SKRIP_INLET_PEKANBARU_DUMAI.ts', 'utf8');
txt = txt.replace(/auth\.currentUser!\.uid/g, '"system"');
fs.writeFileSync('SKRIP_INLET_PEKANBARU_DUMAI.ts', txt);
