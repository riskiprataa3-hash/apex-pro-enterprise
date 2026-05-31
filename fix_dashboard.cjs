const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

// Rename Aktivitas to Riwayat in navItems
content = content.replace(/label: "Aktivitas", icon: Activity/g, 'label: "Riwayat", icon: Activity');
content = content.replace(/Timeline Aktivitas/g, 'Timeline Riwayat');

// Extract context methods in DashboardPage
if (!content.includes('handleDeleteActivity')) {
    content = content.replace(
        /logActivity,/g,
        "logActivity, handleDeleteActivity,"
    );
}

// Add the RIWAYAT tab to mobile nav
if (!content.includes('>RIWAYAT</span>')) {
    const riwayatBtn = `
            {!isClient && (
              <button onClick={() => handleTabChange('activity')} className={cn("flex flex-col items-center justify-center pt-3 pb-2 w-full transition-colors font-sans gap-1 relative", activeTab === 'activity' ? "text-primary" : "")}>
                 <Activity className="w-6 h-6 mx-auto mb-0.5" />
                 <span className="text-xs uppercase font-medium tracking-widest">RIWAYAT</span>
              </button>
            )}
`;
    // Looking for "SURAT</span>\n              </button>\n            )}"
    content = content.replace(
        /(<span className="text-xs uppercase font-medium tracking-widest">SURAT<\/span>\s*<\/button>\s*\n?\s*\}?\s*\)?)/,
        "$1" + riwayatBtn
    );
}

// Add the TRASH button in the Activity items
if (!content.includes('onDelete={() => setDeleteConfirmParams({ isOpen: true, type: \'act\'')) {
    content = content.replace(
        /(<span className="text-\[10px\] font-medium text-muted-foreground">{act\.userEmail}<\/span>\s*<\/div>)/,
        `$1
                                {isAdmin && (
                                  <button onClick={() => setDeleteConfirmParams({ isOpen: true, type: 'act', action: () => handleDeleteActivity(act.id), title: 'Hapus Riwayat', desc: 'Menghapus riwayat aktivitas ini secara permanen?' })} className="p-1 hover:bg-rose-500/10 text-rose-500 rounded transition-colors ml-2" title="Hapus Riwayat">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}`
    );
}

fs.writeFileSync('src/components/DashboardPage.tsx', content);
