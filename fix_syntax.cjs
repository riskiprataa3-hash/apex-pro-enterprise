const fs = require('fs');

const fixAppCtx = () => {
    let t = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
    t = t.replace(/entryData\?\.equipmentUsed/g, 'entryData.equipmentUsed');
    fs.writeFileSync('src/context/AppContext.tsx', t);
}

const fixProj = () => {
    let t = fs.readFileSync('src/components/ProjectDetailPage.tsx', 'utf8');
    t = t.replace(/e\?\?\.equipmentUsed/g, 'e?.equipmentUsed');
    fs.writeFileSync('src/components/ProjectDetailPage.tsx', t);
}

fixAppCtx();
fixProj();
