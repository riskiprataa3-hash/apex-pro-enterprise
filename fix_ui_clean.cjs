const fs = require('fs');

const filesToClean = [
  'src/components/DashboardPage.tsx',
  'src/components/ProjectDetailPage.tsx',
  'src/components/DevMonitorTab.tsx',
  'src/components/AttendanceTab.tsx',
  'src/components/SettingsView.tsx'
];

filesToClean.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace excessive rounding
    content = content.replace(/rounded-\[3rem\]/g, 'rounded-2xl');
    content = content.replace(/rounded-\[2\.5rem\]/g, 'rounded-2xl');
    content = content.replace(/rounded-\[2rem\]/g, 'rounded-2xl');
    content = content.replace(/rounded-3xl/g, 'rounded-2xl');
    
    // Replace heavy shadows
    content = content.replace(/shadow-2xl/g, 'shadow-md');
    content = content.replace(/shadow-inner/g, 'shadow-sm');
    
    // Replace aggressive font weights
    content = content.replace(/font-black/g, 'font-bold');
    
    // P-paddings optimization
    content = content.replace(/p-6 md:p-8/g, 'p-4 md:p-6');
    content = content.replace(/p-8/g, 'p-6');
    content = content.replace(/p-6/g, 'p-5');
    
    // Border thicknesses
    content = content.replace(/border-2 border-/g, 'border border-');

    fs.writeFileSync(file, content);
  }
});
