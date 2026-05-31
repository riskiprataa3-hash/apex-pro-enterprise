import * as fs from 'fs';

let content = fs.readFileSync('src/components/AttendanceTab.tsx', 'utf-8');

// The goal is to move the kasbon button out of the isAdmin block
// Let's find the Kasbon button and extract it.
const kasbonBtnRegex = /<button\s+onClick=\{\(\) => setActiveSubTab\('kasbon'\)\}.*?Kasbon\s+<\/button>/s;
const kasbonBtnMatch = content.match(kasbonBtnRegex);

if (kasbonBtnMatch) {
    const btnStr = kasbonBtnMatch[0];
    // Remove the button from its current location
    content = content.replace(btnStr, '');
    
    // Now find the end of the isAdmin block which is right after `Personil & Gaji\n                </button>\n              </>\n            )}`
    content = content.replace(
        /(Personil & Gaji\s+<\/button>\s+)(<\/?>)\s*\)\}/s,
        `$1$2)}\n\n            ${btnStr}`
    );
    // Actually the block is `</>\n            )}`
    
    content = content.replace(
        /Personil & Gaji\s+<\/button>\s+<\/>\s+\)\}/,
        `Personil & Gaji\n                </button>\n              </>\n            )}\n            ${btnStr}`
    );
}

fs.writeFileSync('src/components/AttendanceTab.tsx', content, 'utf-8');
console.log('Done refactoring');
