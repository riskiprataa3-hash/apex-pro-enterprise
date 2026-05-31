const fs = require('fs');

function addConfirm(file) {
  if (!fs.existsSync(file)) return;
  let c = fs.readFileSync(file, 'utf8');

  // Replace handleCreate, handleDelete, etc with window.confirm
  c = c.replace(/onClick=\{\(\) => handleResolveIncident\(([^)]+)\)\}/g, "onClick={() => { if(window.confirm('Verifikasi Pengerjaan Selesai?')) handleResolveIncident($1); }}");
  
  c = c.replace(/onClick=\{\(\) => handleDeleteActivity\(([^)]+)\)\}/g, "onClick={() => { if(window.confirm('Hapus log aktivitas ini?')) handleDeleteActivity($1); }}");
  
  c = c.replace(/onClick=\{\(\) => handleDeleteEquipmentRequest\(([^)]+)\)\}/g, "onClick={() => { if(window.confirm('Hapus pengajuan ini?')) handleDeleteEquipmentRequest($1); }}");
  
  // also add a wipe button for HSE
  if (file === 'src/components/DashboardPage.tsx') {
    if (!c.includes('window.clearIncidentsAndHSE')) {
      c = c.replace(
        /<Button size="sm" onClick=\{handleClearAll\} variant="outline" className="h-8 text-\[10px\] font-bold">Clear All<\/Button>/,
        `<Button size="sm" onClick={() => { if(window.confirm('WIPE ALL K3 DATA DARI SERVER?')) window.clearIncidentsAndHSE && window.clearIncidentsAndHSE(); handleClearAll(); }} variant="outline" className="h-8 text-[10px] font-bold text-rose-500 border-rose-500/50">Wipe Data</Button>`
      );
    }
  }

  fs.writeFileSync(file, c);
}

const files = [
  'src/components/DashboardPage.tsx',
  'src/components/NeoDashboard.tsx',
  'src/components/ProjectDetailPage.tsx',
  'src/components/LiteModePage.tsx',
];

files.forEach(addConfirm);
console.log('done confirmations');
