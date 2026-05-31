const fs = require('fs');
const files = [
  'src/components/NeoDashboard.tsx',
  'src/components/ProjectDetailPage.tsx',
  'src/components/DashboardPage.tsx',
  'src/components/LiteModePage.tsx',
  'src/App.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  // Make transitions faster and springy
  c = c.replace(/duration: 0\.3/g, 'type: "spring", stiffness: 400, damping: 30');
  c = c.replace(/duration: 0\.4/g, 'type: "spring", stiffness: 400, damping: 30');
  c = c.replace(/duration: 0\.25/g, 'type: "spring", stiffness: 450, damping: 35');
  c = c.replace(/duration: 0\.2/g, 'type: "spring", stiffness: 500, damping: 35');
  c = c.replace(/duration: 0\.15/g, 'type: "spring", stiffness: 500, damping: 35');
  
  // Date format on incidents
  if (f === 'src/components/DashboardPage.tsx') {
      const incDateRegex = /inc.timestamp\).toLocaleTimeString\(\)/g;
      c = c.replace(incDateRegex, "inc.timestamp).toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'}) + ' ' + new Date(inc.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})");
      
      const hseDateRegex = /log.timestamp\).toLocaleTimeString\(\)/g;
      c = c.replace(hseDateRegex, "log.timestamp).toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit', year:'numeric'}) + ' ' + new Date(log.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})");
  }
  
  fs.writeFileSync(f, c);
});
console.log('done');
