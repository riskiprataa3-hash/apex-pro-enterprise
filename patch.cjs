const fs = require('fs');
const filesToPatch = [
    'src/components/DashboardPage.tsx',
    'src/components/ProjectDetailPage.tsx',
    'src/components/NeoDashboard.tsx',
    'src/utils/pdfExport.ts',
    'src/context/AppContext.tsx'
];

filesToPatch.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace hardcoded 401 manual additions
    content = content.replace(/const manualAddition = isPekanbaruDumai(Inlet)? \? 401 : 0;/g, 'const manualAddition = 0;');
    content = content.replace(/const dynamicsOffset = \(isPekanbaruDumaiInlet && !isFiltered\) \? 401 : 0;/g, 'const dynamicsOffset = 0;');
    content = content.replace(/const totalCompleted = realizedAsli \+ 401;/g, 'const totalCompleted = realizedAsli;');
    content = content.replace(/done \+= 401;/g, '');
    
    // Replace 1839 with 1104
    content = content.replace(/1839/g, '1104');
    
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
});
