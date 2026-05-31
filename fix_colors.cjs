const fs = require('fs');
const file = 'src/components/DashboardPage.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace hardcoded messy colors with clean semantic tailwind variations
  content = content.replace(/bg-\[#8B93A4\] hover:bg-\[#727989\]/g, 'bg-primary hover:bg-primary/90');
  content = content.replace(/bg-\[#C8CDD5\]/g, 'bg-card border border-border/50');
  content = content.replace(/bg-\[#B6BBC3\]/g, 'bg-accent');
  content = content.replace(/bg-\[#C6CAD2\]/g, 'bg-card border border-border/50');
  
  // Also clean up typography inside those boxes
  content = content.replace(/text-slate-800/g, 'text-foreground');
  content = content.replace(/text-slate-700/g, 'text-muted-foreground');
  
  // Make the UI overall background cleaner if there is one hardcoded
  content = content.replace(/bg-\[#F2F4F7\]/g, 'bg-background');
  
  // Change "rounded-[2rem]" or any large rounding remaining
  content = content.replace(/rounded-\[.*?\]/g, 'rounded-2xl');

  fs.writeFileSync(file, content);
}
