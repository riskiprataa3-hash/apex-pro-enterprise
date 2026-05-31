const fs = require('fs');
let code = fs.readFileSync('src/components/ProjectDetailPage.tsx', 'utf8');

if (!code.includes('Lihat Data')) {
  const btnToAdd = `
                             <Button 
                               onClick={() => {
                                 setStartDate(group.dateKey);
                                 setEndDate(group.dateKey);
                                 setFilterLajur('');
                                 setSearchQuery('');
                                 setActiveTab('data');
                                 window.scrollTo({ top: 0, behavior: 'smooth' });
                               }}
                               variant="outline" 
                               className="w-full rounded-2xl h-12 shadow-sm border-primary/20 flex items-center justify-center gap-2 group overflow-hidden bg-primary/5 hover:bg-primary/10"
                             >
                               <Eye className="w-4 h-4 text-primary relative z-10" />
                               <span className="text-[10px] font-black uppercase tracking-widest relative z-10 text-primary">Lihat Data</span>
                             </Button>`;

  const insertIndex = code.indexOf('<div className="mt-8 flex flex-col gap-2">');
  if (insertIndex !== -1) {
     code = code.substring(0, insertIndex + 42) + '\n' + btnToAdd + '\n' + code.substring(insertIndex + 42);
     fs.writeFileSync('src/components/ProjectDetailPage.tsx', code);
  }
}
