const fs = require('fs');

if (fs.existsSync('src/components/DashboardPage.tsx')) {
  let text = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

  // Polish Mobile navigation background
  text = text.replace(/bg-slate-700 text-slate-400/g, 'bg-card/90 backdrop-blur-xl border-t border-border/50 text-muted-foreground');
  
  // Polish active mobile nav items
  text = text.replace(/text-white bg-slate-800\/50/g, 'text-primary');
  
  // Update heavy border radius on floating elements
  text = text.replace(/rounded-\[3rem\]/g, 'rounded-2xl');
  text = text.replace(/rounded-\[2\.5rem\]/g, 'rounded-2xl');
  
  // Some ugly backgrounds 
  text = text.replace(/bg-slate-900 border border-slate-800/g, 'bg-card border border-border/50');
  text = text.replace(/bg-slate-800 border-slate-700/g, 'bg-muted/50 border-border');

  fs.writeFileSync('src/components/DashboardPage.tsx', text);
}

const fixDev = 'src/components/DevMonitorTab.tsx';
if (fs.existsSync(fixDev)) {
  let text = fs.readFileSync(fixDev, 'utf8');
  text = text.replace(/bg-slate-900 border border-slate-800/g, 'bg-card border border-border/50');
  text = text.replace(/bg-slate-800\/80/g, 'bg-muted/50');
  fs.writeFileSync(fixDev, text);
}

const attTab = 'src/components/AttendanceTab.tsx';
if (fs.existsSync(attTab)) {
  let text = fs.readFileSync(attTab, 'utf8');
  text = text.replace(/bg-slate-900/g, 'bg-card');
  text = text.replace(/bg-slate-800/g, 'bg-muted');
  fs.writeFileSync(attTab, text);
}
