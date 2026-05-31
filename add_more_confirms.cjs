const fs = require('fs');
let c = fs.readFileSync('src/components/AttendanceTab.tsx', 'utf8');

c = c.replace(/onClick=\{\(\) => handleAction\('tbm'\)\}/g, "onClick={() => { if(window.confirm('Verifikasi Checkout Data Toolbox Meeting (Masuk)? Peringatan: TBM hanya diizinkan 1x per hari.')) handleAction('tbm'); }}");
c = c.replace(/onClick=\{\(\) => handleAction\('checkout'\)\}/g, "onClick={() => { if(window.confirm('Verifikasi Cekout Data Presensi Pulang? Pekerjaan hari ini akan selesai.')) handleAction('checkout'); }}");

fs.writeFileSync('src/components/AttendanceTab.tsx', c);

let dl = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');
dl = dl.replace(/onSubmit=\{handleAddWorkerForm\}/g, "onSubmit={(e) => { e.preventDefault(); if(window.confirm('Konfirmasi simpan data master pekerja?')) handleAddWorkerForm(e); }}");

fs.writeFileSync('src/components/DashboardPage.tsx', dl);
console.log('Added more confirms');
