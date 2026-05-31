const fs = require('fs');

const repairTags = (file) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<span className="ml-[^>]*>([^<]*)<\/Badge>/g, '<Badge className="ml-2">$1</Badge>'); 
    // Wait, the easiest way is to revert all replacement.
    
    // I can just replace `</Badge>` where it's orphaned? No, I need the git log or just replace back `span`.
    
    // Actually, I can just write a quick script to fix `<span className="ml-2` back to `<Badge className="ml-2`
    content = content.replace(/<span className="ml-2/g, '<Badge className="ml-2');
    
    
    fs.writeFileSync(file, content);
  }
}

['src/components/DashboardPage.tsx','src/components/DevMonitorTab.tsx','src/components/ProjectDetailPage.tsx'].forEach(repairTags);

// Fix ProjectDetail equipmentUsed syntax error
let pd = fs.readFileSync('src/components/ProjectDetailPage.tsx', 'utf8');
pd = pd.replace(/\?\.\?\.equipmentUsed/g, '?.equipmentUsed');
fs.writeFileSync('src/components/ProjectDetailPage.tsx', pd);

// Make sure Badge is imported in DevMonitorTab
let dt = fs.readFileSync('src/components/DevMonitorTab.tsx', 'utf8');
if (!dt.includes('Badge')) {
  dt = "import { Badge } from './ui/Base';\n" + dt;
}
fs.writeFileSync('src/components/DevMonitorTab.tsx', dt);
