const fs = require('fs');
const files = [
  'src/components/AttendanceTab.tsx',
  'src/utils/excelExport.ts',
  'src/utils/pdfExport.ts',
  'src/context/AppContext.tsx',
  'src/components/ProjectDetailPage.tsx',
  'src/components/DashboardPage.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/eachCell\((cell) =>/g, "eachCell((cell: any) =>");
    content = content.replace(/eachCell\((c) =>/g, "eachCell((c: any) =>");
    content = content.replace(/eachCell\(c =>/g, "eachCell((c: any) =>");
    content = content.replace(/eachCell\(cell =>/g, "eachCell((cell: any) =>");
    content = content.replace(/eachCell\(\(cell, colNumber\)/g, "eachCell((cell: any, colNumber: any)");
    content = content.replace(/eachRow\(\(row, rowNumber\)/g, "eachRow((row: any, rowNumber: any)");
    fs.writeFileSync(file, content);
  }
});