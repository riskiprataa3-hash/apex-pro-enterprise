const fs = require('fs');

['src/components/DashboardPage.tsx', 'src/components/DevMonitorTab.tsx', 'src/components/ProjectDetailPage.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Fix ??. syntax error
    content = content.replace(/\?\?\./g, '?.');

    // Regex to match <Badge ...> ... </span> and replace with </Badge>
    // This is tricky if there are nested spans. 
    // Since these badges contain simple text, they match: <Badge([^>]*)>([^<]*)<\/span>
    content = content.replace(/<Badge([^>]*)>([^<]*)<\/span>/g, '<Badge$1>$2</Badge>');
    
    // Sometimes there are nested icons.
    content = content.replace(/<Badge([^>]*)>(.*?)<\/span>/g, (match, p1, p2) => {
      // Very hacky but normally works if it spans a single line or short block
      return `<Badge${p1}>${p2}</Badge>`;
    });

    fs.writeFileSync(file, content);
  }
});
