const fs = require('fs');
let code = fs.readFileSync('src/components/ProjectDetailPage.tsx', 'utf8');

if (!code.includes(' Eye,') && !code.includes('{ Eye }')) {
    code = code.replace(/import \{([^}]*)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
        return `import { ${p1}, Eye } from 'lucide-react';`;
    });
    fs.writeFileSync('src/components/ProjectDetailPage.tsx', code);
}
