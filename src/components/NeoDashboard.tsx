import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Folder, CheckCircle, BarChart3, Database } from 'lucide-react';

export const NeoDashboard = () => {
  const { user, projects, userCheckIn, handleCheckIn, handleCheckOut } = useApp();

  // Search project inlet (PEKANBARU-DUMAI)
  const inletProject = projects.find(p => p.type === 'inlet' && p.name?.toUpperCase().includes('PEKANBARU-DUMAI'));
  
  // Realized
  const allEntries = inletProject?.entries || [];
  const realizedAsli = allEntries.filter(e => !e.isArchived).reduce((acc, e) => acc + (Number(e.qty) || 0), 0);
  const totalCompleted = realizedAsli + 401;

  // Target
  const target = inletProject?.targetQty || 1839; // Diisi ulang jika berbeda
  const progressPercent = Math.min(100, Math.round((totalCompleted / target) * 100)) || 0;
  
  // Ambil nama user
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Tim';
  const initial = firstName.charAt(0).toUpperCase();

  // Ambil 3 riwayat terakhir dari B/OS
  const riwayatTerbaru = allEntries
    .filter(e => !e.isArchived)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  // Stats ringkasan (Mocked slightly from actual to fit mockup, or use real data)
  const totalProjects = projects.length;
  const tugasCompleted = totalCompleted;
  const progressRata = progressPercent;
  const dataTerinput = totalCompleted;

  return (
    <div className="font-sans pb-4 -mx-4 lg:-mx-12 -mt-6 bg-[#F5F7FB] dark:bg-background h-full min-h-screen">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 800, damping: 40 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-b-[30px] p-5 pt-10 shadow-xl relative text-white"
      >
        <div className="flex items-center justify-between z-10 relative">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Apex Pro CPM</h1>
            <p className="text-sm opacity-90">Toll Road Project Monitoring</p>
          </div>
        </div>

        <div className="mt-5 bg-white/15 backdrop-blur-md rounded-3xl p-4 border border-white/10 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-80">Good Morning</p>
              <h2 className="text-xl font-semibold">{firstName} 👋</h2>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70 mb-1">Attendance Status</p>
              {userCheckIn ? (
                <span className="bg-emerald-400 text-emerald-950 px-3 py-1 rounded-full text-xs font-bold inline-block">
                  Checked In
                </span>
              ) : (
                <span className="bg-rose-400 text-rose-950 px-3 py-1 rounded-full text-xs font-bold inline-block">
                  Not Checked In
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
              onClick={handleCheckIn}
              disabled={!!userCheckIn}
              className={`font-semibold py-3 gap-2 rounded-2xl shadow-md transition-all ${userCheckIn ? 'bg-white/40 text-white cursor-not-allowed opacity-50' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
            >
              Check In
            </button>
            <button 
              onClick={handleCheckOut}
              disabled={!userCheckIn}
              className={`font-semibold py-3 gap-2 rounded-2xl shadow-md transition-all ${!userCheckIn ? 'bg-slate-900/40 text-white cursor-not-allowed opacity-50' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              Check Out
            </button>
          </div>
        </div>
      </motion.div>

      {/* RINGKASAN METRICS GRID */}
      <div className="px-5 mt-5 relative z-20 flex flex-col gap-5 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {/* Card 1 */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, delay: 0.1 }}
             className="bg-white dark:bg-card rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-border/50 flex flex-col justify-between"
          >
             <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center mb-3">
               <Folder className="w-5 h-5" />
             </div>
             <div>
               <div className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Total Projects</div>
               <h3 className="text-2xl font-bold mt-1 text-foreground">{totalProjects.toLocaleString('id-ID')}</h3>
             </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, delay: 0.15 }}
             className="bg-white dark:bg-card rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-border/50 flex flex-col justify-between"
          >
             <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center mb-3">
               <CheckCircle className="w-5 h-5" />
             </div>
             <div>
               <div className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Tasks Completed</div>
               <h3 className="text-2xl font-bold mt-1 text-foreground">{tugasCompleted.toLocaleString('id-ID')}</h3>
             </div>
          </motion.div>
          
          {/* Card 3 */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, delay: 0.2 }}
             className="bg-white dark:bg-card rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-border/50 flex flex-col justify-between"
          >
             <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-3">
               <BarChart3 className="w-5 h-5" />
             </div>
             <div>
               <div className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Average Progress</div>
               <h3 className="text-2xl font-bold mt-1 text-foreground">{progressRata}%</h3>
             </div>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
             initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, delay: 0.25 }}
             className="bg-white dark:bg-card rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-border/50 flex flex-col justify-between"
          >
             <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center mb-3">
               <Database className="w-5 h-5" />
             </div>
             <div>
               <div className="text-sm font-medium text-slate-500 dark:text-muted-foreground">Data Inputted</div>
               <h3 className="text-2xl font-bold mt-1 text-foreground">{dataTerinput.toLocaleString('id-ID')}</h3>
             </div>
          </motion.div>
        </div>

        {/* MODERN LIST: PROYEK AKTIF */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, delay: 0.3 }} className="mt-2">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-foreground">Active Projects</h2>
             <button onClick={() => {
                const btn = document.querySelector('button[aria-label="Main Menu"]') as HTMLButtonElement | null;
                if (btn) btn.click();
              }} className="text-blue-600 font-semibold text-sm hover:underline">Main Menu</button>
          </div>
          
          <div className="flex flex-col gap-4">
            {projects.slice(0, 3).map((p, idx) => {
                const target = p.targetQty || 1;
                let done = p.entries?.filter(e => !e.isArchived).reduce((acc, e) => acc + (Number(e.qty) || 0), 0) || 0;

                if (p.name?.toUpperCase().includes('PEKANBARU-DUMAI') && p.type === 'inlet') {
                  done += 401;
                }

                const perc = Math.min(100, Math.round((done / target) * 100)) || 0;

                return (
                    <div key={p.id || idx} className="bg-white dark:bg-card rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-border/50 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                           <h3 className="font-bold text-lg leading-tight text-foreground">{p.name}</h3>
                           <p className="text-sm text-slate-500 dark:text-muted-foreground mt-1">
                             {p.type === 'inlet' ? 'OS Maintenance' : 'Public Works'} • {target} Points
                           </p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shrink-0">
                          Running
                        </span>
                      </div>

                      <div className="mt-4">
                         <div className="flex justify-between text-sm mb-2 text-foreground">
                           <span>Progress</span>
                           <span className="font-semibold">{perc}%</span>
                         </div>
                         <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                           <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full" style={{ width: `${perc}%` }}></div>
                         </div>
                      </div>
                    </div>
                );
            })}
            
            {projects.length === 0 && (
                <div className="p-8 flex flex-col items-center justify-center text-center gap-3 bg-white dark:bg-card rounded-3xl border border-dashed border-slate-200">
                   <p className="text-sm text-muted-foreground">No active projects</p>
                </div>
            )}
          </div>
        </motion.div>
        
        {/* TIMELINE / AKTIVITAS */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, delay: 0.4 }} className="mt-2 mb-24">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-foreground">Activities</h2>
             <button className="text-blue-600 font-semibold text-sm">History</button>
          </div>
          
          <div className="space-y-4">
            {riwayatTerbaru.length > 0 ? (
               riwayatTerbaru.map((e, idx) => (
                 <div key={e.id || idx} className="bg-white dark:bg-card rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100 dark:border-border/50">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-xl shrink-0">
                      📌
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Upload Progress STA {e.km}</h3>
                      <p className="text-sm text-slate-500 dark:text-muted-foreground">{new Date(e.timestamp).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})} • {new Date(e.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} • {e.signType || 'INLET'}</p>
                    </div>
                 </div>
               ))
            ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center gap-3 bg-white dark:bg-card rounded-3xl border border-dashed border-slate-200">
                   <p className="text-sm text-muted-foreground">No activities today</p>
                </div>
            )}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

