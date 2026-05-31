import { readFileSync, writeFileSync } from 'fs';
let code = readFileSync('src/components/DashboardPage.tsx', 'utf-8');

// Update Top Action Bar
const oldActionBarStart = "         {/* Top Action Bar */}";
const oldActionBarEnd = "         </header>";

const actionBarRegex = new RegExp(oldActionBarStart + "[\\s\\S]*?" + oldActionBarEnd);
const newActionBar = `         {/* Top Action Bar */}
         <header className="flex items-center justify-between px-4 md:px-8 py-4 z-40 relative bg-transparent">
           <div className="flex items-center gap-3">
             {activeTab === 'home' ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer">
                     <ApexLogo className="w-8 h-8" size={16} hideText={true} />
                  </div>
                </div>
             ) : (
                <button 
                  onClick={() => handleTabChange('home')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all border-none font-bold shadow-md"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" strokeWidth={2.5} />
                  <span className="font-black text-xs tracking-wider uppercase">Kembali</span>
                </button>
             )}
           </div>

           <div className="flex items-center gap-2 sm:gap-3">
             {notificationPerm !== 'granted' && notificationPerm !== 'denied' && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={requestNotification}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 shadow-sm border hover:bg-amber-500/20 border-amber-500/30 text-amber-600 animate-pulse bg-white/40 backdrop-blur-md"
                  title="Aktifkan Push Notifikasi"
                >
                  <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
             )}
              
             <Button
               variant="outline"
               size="icon"
               onClick={() => navigate('/lite')}
               className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white dark:bg-slate-800 border-none shadow-sm text-emerald-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold"
               title="Lite / Offline Mode"
             >
               <WifiOff className="w-4 h-4 sm:w-5 sm:h-5" />
             </Button>
             
             <Button
               variant="outline"
               size="icon"
               onClick={() => setIsDarkMode(!isDarkMode)}
               className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#8B93A4] border-none font-bold text-white hover:bg-[#727989] transition-all shadow-sm"
             >
               {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
             </Button>
              
             <Button
               variant="outline"
               size="icon"
               onClick={() => exportAllProjectsExcel()}
               className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white dark:bg-slate-800 border-none shadow-sm font-bold text-foreground hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
               title="Unduh Data"
             >
               <Download className="w-4 h-4 sm:w-5 sm:h-5" />
             </Button>
             
             {!isStandalone && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleInstallApp}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 md:hidden flex items-center justify-center bg-indigo-600 border-none shadow-sm text-white hover:bg-indigo-700 font-bold transition-all"
                >
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                </Button>
             )}
             
             <Button
               variant="ghost"
               onClick={() => handleTabChange('settings')}
               className="rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white dark:bg-slate-800 border-none shadow-sm text-foreground font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
             >
               <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
             </Button>
           </div>
         </header>`;

code = code.replace(actionBarRegex, newActionBar);

// Update bottom nav
const oldBottomNavStart = "{/* Sleek Mobile Bottom Nav */}";
const oldBottomNavEnd = "      </footer>";

const bottomNavRegex = new RegExp(oldBottomNavStart + "[\\s\\S]*?" + oldBottomNavEnd);
const newBottomNav = \`{/* Sleek Mobile Bottom Nav */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-2xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] text-muted-foreground pb-safe">
        <nav className="flex items-center justify-around relative px-2">
            <button onClick={() => handleTabChange('home')} className={cn("flex flex-col items-center justify-center py-3 w-16 transition-all duration-300 gap-1 relative", activeTab === 'home' || activeTab === 'help' ? "text-indigo-600 dark:text-indigo-400 scale-110" : "hover:text-foreground hover:scale-105")}>
               <Home className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" strokeWidth={activeTab === 'home' || activeTab === 'help' ? 2.5 : 2} />
               <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">Home</span>
            </button>
            {!isAudit && (
              <button onClick={() => handleTabChange('tasks')} className={cn("flex flex-col items-center justify-center py-3 w-16 transition-all duration-300 gap-1 relative", activeTab === 'tasks' ? "text-indigo-600 dark:text-indigo-400 scale-110" : "hover:text-foreground hover:scale-105")}>
                 <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" strokeWidth={activeTab === 'tasks' ? 2.5 : 2} />
                 <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">WO</span>
              </button>
            )}
            <button onClick={() => handleTabChange('projects')} className={cn("flex flex-col items-center justify-center py-3 w-16 transition-all duration-300 gap-1 relative", activeTab === 'projects' ? "text-indigo-600 dark:text-indigo-400 scale-110" : "hover:text-foreground hover:scale-105")}>
               <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" strokeWidth={activeTab === 'projects' ? 2.5 : 2} />
               <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">Sisir</span>
            </button>
            {!isAudit && (
              <button onClick={() => handleTabChange('messages')} className={cn("flex flex-col items-center justify-center py-3 w-16 transition-all duration-300 gap-1 relative", activeTab === 'messages' ? "text-indigo-600 dark:text-indigo-400 scale-110" : "hover:text-foreground hover:scale-105")}>
                 <Mail className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" strokeWidth={activeTab === 'messages' ? 2.5 : 2} />
                 <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">Surat</span>
              </button>
            )}
            {!isAudit && (
              <button onClick={() => handleTabChange('activity')} className={cn("flex flex-col items-center justify-center py-3 w-16 transition-all duration-300 gap-1 relative", activeTab === 'activity' ? "text-indigo-600 dark:text-indigo-400 scale-110" : "hover:text-foreground hover:scale-105")}>
                 <Activity className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" strokeWidth={activeTab === 'activity' ? 2.5 : 2} />
                 <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">Riwayat</span>
              </button>
            )}
        </nav>
      </footer>\`;

code = code.replace(bottomNavRegex, newBottomNav);

writeFileSync('src/components/DashboardPage.tsx', code);
console.log("Replaced UI elements successfully!");
