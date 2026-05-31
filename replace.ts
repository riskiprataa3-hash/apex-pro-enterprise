import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/DashboardPage.tsx', 'utf-8');

const startMarker = "{/* Top SHAKA Cover Header */}";
const endMarker = "{/* Informasi Akun */}";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const before = code.substring(0, startIndex);
const after = code.substring(endIndex);

const newCode = before + "<NeoDashboard />\n\n                 " + after;

writeFileSync('src/components/DashboardPage.tsx', newCode);
console.log("Replaced successfully!");
