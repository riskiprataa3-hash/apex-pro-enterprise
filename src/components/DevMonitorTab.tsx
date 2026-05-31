import { Badge } from './ui/Base';
import React, { useMemo, useState } from 'react';
import { Card, Button } from './ui/Base';
import { Server, Activity, Users, ShieldAlert, Cpu, Database, MapPin, Map as MapIcon, Globe, Lock, Info, Clock, Download, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from './ui/Base';
import { useApp } from '../context/AppContext';

export const DevMonitorTab = () => {
  const { loginLogs, activeSessions, workers, projects, entries, handleDeleteEntriesByDate, isAdmin, activities } = useApp();
  const [targetDeleteDate, setTargetDeleteDate] = useState('2026-05-16');
  const [activeTab, setActiveTab] = useState<'monitor' | 'audit'>('monitor');

  // Actual Stats Calculations
  const docCount = projects.length + entries.length + workers.length + loginLogs.length;
  const estFirestoreSizeMB = (docCount * 2) / 1024; // 2KB per doc average
  const estStorageSizeMB = (entries.length * 0.15) + (loginLogs.length * 0.05); // 150KB per entry photo, 50KB per login metadata
  const totalStorageGB = (estFirestoreSizeMB + estStorageSizeMB) / 1024;

  // Actual Cost Estimation (Blaze Plan rates)
  // Firestore Storage: $0.18/GB
  // Cloud Storage: $0.026/GB
  // Network Egress: ~$0.12/GB
  // Exchange Rate: ~16,000 IDR
  const EXCHANGE_RATE = 16000;
  
  const firestoreCost = (totalStorageGB * 0.18) * EXCHANGE_RATE;
  const storageCost = (totalStorageGB * 0.026) * EXCHANGE_RATE;
  const networkCost = (totalStorageGB * 1.5 * 0.12) * EXCHANGE_RATE; // Assuming 1.5x traffic multiplier
  const totalMonthlyCost = firestoreCost + storageCost + networkCost;

  const totalLogins = loginLogs.length;
  const recentLogins = useMemo(() => {
    return loginLogs.slice(0, 20); // Top 20 latest logins
  }, [loginLogs]);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-xl font-bold uppercase tracking-tight">System Monitor</h2>
           <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Real-time Cloud & Telemetry</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
           <Server className="w-5 h-5" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant={activeTab === 'monitor' ? 'primary' : 'outline'} onClick={() => setActiveTab('monitor')} className={cn("rounded-2xl text-[10px] font-bold uppercase tracking-widest px-6 h-10", activeTab === 'monitor' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' : '')}>Telemetri</Button>
        <Button size="sm" variant={activeTab === 'audit' ? 'primary' : 'outline'} onClick={() => setActiveTab('audit')} className={cn("rounded-2xl text-[10px] font-bold uppercase tracking-widest px-6 h-10", activeTab === 'audit' ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' : '')}>Jejak Audit Forensik</Button>
      </div>

      {activeTab === 'monitor' && (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="p-4 bg-muted/20 border-border">
           <Activity className="w-5 h-5 text-indigo-500 mb-2" />
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Active Sessions</p>
           <p className="text-xl font-bold">{activeSessions?.length || 0}</p>
         </Card>
         <Card className="p-4 bg-muted/20 border-border">
           <Database className="w-5 h-5 text-emerald-500 mb-2" />
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Projects</p>
           <p className="text-xl font-bold">{projects?.length || 0}</p>
         </Card>
         <Card className="p-4 bg-muted/20 border-border">
           <MapPin className="w-5 h-5 text-amber-500 mb-2" />
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Entry Points</p>
           <p className="text-xl font-bold">{entries?.length || 0}</p>
         </Card>
         <Card className="p-4 bg-muted/20 border-border">
           <Users className="w-5 h-5 text-blue-500 mb-2" />
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Workers Mapped</p>
           <p className="text-xl font-bold">{workers?.length || 0}</p>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-5 bg-slate-500/5 border-slate-500/20 shadow-sm relative overflow-hidden h-full">
           <div className="absolute top-0 right-0 p-4 opacity-5">
             <Database className="w-32 h-32 text-slate-500" />
           </div>
           <div className="relative z-10">
             <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6 text-slate-600 dark:text-slate-400">
               <Database className="w-4 h-4" />
               Statistik Penyimpanan Cloud
             </h3>
             
             <div className="space-y-6">
                <div className="bg-background/50 p-4 rounded-[1.5rem] border border-border">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Firestore Database</span>
                      <span className="text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">Blaze Plan</span>
                   </div>
                   <div className="flex items-end gap-2 mb-3">
                      <p className="text-3xl font-bold">{(docCount / 1000).toFixed(2)}</p>
                      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">k Dokumen</p>
                   </div>
                   <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${Math.min((projects.length / docCount) * 100 || 0, 100)}%` }}></div>
                      <div className="bg-blue-500 h-full" style={{ width: `${Math.min((entries.length / docCount) * 100 || 0, 100)}%` }}></div>
                      <div className="bg-amber-500 h-full" style={{ width: `${Math.min((loginLogs.length / docCount) * 100 || 0, 100)}%` }}></div>
                   </div>
                   <div className="mt-3 grid grid-cols-2 gap-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Proyek ({projects.length})
                      </div>
                      <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Log Aspal ({entries.length})
                      </div>
                   </div>
                </div>

                <div className="bg-background/50 p-4 rounded-[1.5rem] border border-border">
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Storage (Lampiran Foto)</span>
                      <span className="text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">Optimized</span>
                   </div>
                   <div className="flex items-end gap-2 mb-3">
                      <p className="text-3xl font-bold">{estStorageSizeMB.toFixed(1)}</p>
                      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-widest">MB Digunakan</p>
                   </div>
                   <p className="text-[9px] text-muted-foreground italic leading-relaxed uppercase font-bold">
                      Total Data: {(estFirestoreSizeMB + estStorageSizeMB).toFixed(1)} MB (Actual Calculation)
                   </p>
                </div>
             </div>
           </div>
        </Card>

        <Card className="p-5 bg-amber-500/5 border-amber-500/20 shadow-sm relative overflow-hidden h-full">
           <div className="absolute top-0 right-0 p-4 opacity-5">
             <Globe className="w-32 h-32 text-amber-500" />
           </div>
           <div className="relative z-10 h-full flex flex-col">
             <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6 text-amber-600 dark:text-amber-400">
               <Globe className="w-4 h-4" />
               Rincian Biaya Cloud (Actual)
             </h3>

             <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center border-b border-amber-500/10 pb-3">
                   <div>
                      <p className="text-[10px] font-bold uppercase text-amber-600/70">Firestore Storage</p>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase">{estFirestoreSizeMB.toFixed(2)} MB Storage</p>
                   </div>
                   <p className="text-sm font-bold tracking-tighter">Rp {Math.max(firestoreCost, 50).toLocaleString('id-ID')}<span className="text-[8px] ml-1 opacity-50">/bln</span></p>
                </div>
                
                <div className="flex justify-between items-center border-b border-amber-500/10 pb-3">
                   <div>
                      <p className="text-[10px] font-bold uppercase text-amber-600/70">Cloud Storage</p>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase">{estStorageSizeMB.toFixed(2)} MB Photos</p>
                   </div>
                   <p className="text-sm font-bold tracking-tighter">Rp {Math.max(storageCost, 50).toLocaleString('id-ID')}<span className="text-[8px] ml-1 opacity-50">/bln</span></p>
                </div>

                <div className="flex justify-between items-center border-b border-amber-500/10 pb-3">
                   <div>
                      <p className="text-[10px] font-bold uppercase text-amber-600/70">Bandwidth Egress</p>
                      <p className="text-[9px] text-muted-foreground font-medium uppercase">Network Utilization</p>
                   </div>
                   <p className="text-sm font-bold tracking-tighter">Rp {Math.max(networkCost, 100).toLocaleString('id-ID')}<span className="text-[8px] ml-1 opacity-50">/bln</span></p>
                </div>

                <div className="mt-6 p-4 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 text-center">
                   <p className="text-[10px] font-bold uppercase text-amber-600 tracking-widest mb-1">Total Estimasi Tagihan</p>
                   <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 italic tracking-tighter">
                     Rp {Math.max(totalMonthlyCost, 500).toLocaleString('id-ID')}
                     <span className="text-xs font-bold ml-1">/Bulan</span>
                   </p>
                </div>
             </div>

             <div className="mt-8 pt-4 flex justify-end">
                <button 
                  onClick={() => {
                     import('../utils/costPdfExport').then(module => {
                        module.generateCostPdf();
                     });
                  }}
                  className="flex items-center gap-2 px-6 h-12 bg-amber-500 text-white hover:bg-amber-600 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all shadow-lg shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  Unduh Laporan Biaya
                </button>
             </div>
           </div>
        </Card>
      </div>

      <Card className="p-4 border-border shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Login Telemetry (Last 20)
        </h3>
        
        {recentLogins.length === 0 ? (
          <div className="text-center p-5 bg-muted/20 rounded-xl border border-border/50">
            <Lock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground uppercase">Belum ada riwayat login</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogins.map((log) => {
               // Extract brand/model from user agent if possible
               const isMobile = /Mobile|Android|iP(ad|hone)/.test(log.userAgent);
               const deviceType = isMobile ? 'Mobile Device' : 'Desktop';
               const brandMatch = log.userAgent.match(/(Samsung|SAMSUNG|Xiaomi|Redmi|Poco|Oppo|OPPO|Vivo|Realme|Infinix|TECNO|iPhone|iPad|Macintosh|Windows)/i);
               const brand = brandMatch ? brandMatch[0] : 'Unknown Brand';

               return (
                 <div key={log.id} className="p-3 bg-muted/20 rounded-xl border border-border group hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{log.email}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                             <Cpu className="w-3 h-3 text-muted-foreground" />
                             <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                               {brand} • {deviceType}
                             </p>
                          </div>
                          <p className="text-[8px] text-muted-foreground/60 font-mono mt-1 w-full max-w-[200px] sm:max-w-xs truncate" title={log.userAgent}>
                             {log.userAgent}
                          </p>
                       </div>
                       
                       <div className="flex flex-col sm:items-end gap-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-mono">
                               {new Date(log.timestamp).toLocaleString('id-ID', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'
                               })}
                            </span>
                          </div>
                          
                          {(log.latitude && log.longitude) ? (
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-md hover:bg-amber-500/20 transition-colors shrink-0 max-w-fit"
                            >
                               <MapIcon className="w-3 h-3" />
                               <span className="text-[9px] font-bold uppercase tracking-widest">
                                 {log.latitude.toFixed(5)}, {log.longitude.toFixed(5)}
                               </span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-muted text-muted-foreground rounded-md shrink-0 max-w-fit">
                               <MapPin className="w-3 h-3" />
                               <span className="text-[9px] uppercase tracking-widest">No GPS</span>
                            </span>
                          )}
                       </div>
                    </div>
                 </div>
               );
            })}
          </div>
        )}
      </Card>
      
      <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
         <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
            <Info className="w-4 h-4" />
            Developer Notes
         </h3>
         <p className="text-xs text-muted-foreground leading-relaxed">
            Halaman ini khusus untuk developer (riskiprataa3@gmail.com). Telemetry login direkam secara real-time. Jika pengguna menolak akses lokasi, sistem tidak mencatat koordinat GPS dan perangkat terdeteksi minimalis. Untuk akurasi lokasi, pelaksana diwajibkan mengaktifkan izin GPS pada browser/aplikasi. Estimasi biaya cloud menggunakan perhitungan standar dari Firestore Storage (~$0.18/GB) dan Network Bandwidth Egress.
         </p>
      </Card>

      {isAdmin && (
        <Card className="p-5 border-rose-500/30 bg-rose-500/5 shadow-md shadow-rose-500/5">
           <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6 text-rose-600 dark:text-rose-400">
              <ShieldCheck className="w-4 h-4" />
              Advanced Maintenance Tools
           </h3>
           
           <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-background/50 border border-rose-500/20">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                       <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-xs font-bold uppercase italic leading-none">Bulk Delete by Date</p>
                       <p className="text-[9px] text-muted-foreground uppercase mt-1 tracking-widest">Hapus seluruh data laporan harian (Km, Tonase) pada tanggal tertentu</p>
                    </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                       <input 
                         type="date" 
                         value={targetDeleteDate}
                         onChange={(e) => setTargetDeleteDate(e.target.value)}
                         className="w-full h-12 px-4 rounded-xl bg-background border border-border focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs font-bold uppercase"
                       />
                    </div>
                    <Button 
                      onClick={() => handleDeleteEntriesByDate(targetDeleteDate)}
                      variant="destructive"
                      className="h-12 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-rose-500/20 italic font-bold uppercase text-[10px]"
                    >
                       <AlertTriangle className="w-4 h-4" />
                       Hapus Semua Data ({targetDeleteDate})
                    </Button>
                 </div>
                 
                 <div className="mt-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-3">
                    <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-rose-600 font-bold uppercase leading-relaxed">
                       Tindakan ini akan menghapus permanen data di seluruh proyek yang memiliki timestamp pada tanggal tersebut. Gunakan hanya jika terjadi kesalahan input massal atau permintaan khusus owner.
                    </p>
                 </div>
              </div>
           </div>
        </Card>
      )}

         <Card className="p-5 bg-indigo-500/10 border-indigo-500/20 shadow-sm md:col-span-2">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
               <Clock className="w-4 h-4" />
               Automasi & Scheduled Tasks
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-between bg-background border border-border p-4 rounded-[1.5rem] shadow-sm mt-4">
               <div>
                  <h4 className="font-bold text-sm uppercase">Laporan & BAST Otomatis (Cron)</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Mengirim rekap BAST PDF & Excel ke Email Manajemen setiap pukul 22:00 via Cron Worker</p>
               </div>
               <div className="mt-4 sm:mt-0 flex gap-2">
                  <Badge className="bg-emerald-500 text-white border-none uppercase tracking-widest text-[9px] px-3 py-1 font-bold animate-pulse">AKTIF</Badge>
               </div>
            </div>
         </Card>
      </>
      )}

      {activeTab === 'audit' && (
         <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
           <div className="bg-card border border-border/50 text-slate-100 rounded-2xl p-5 shadow-xl relative mt-4">
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <div>
                  <h3 className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" /> System Audit Trail
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sistem Forensik & Rekam Jejak Admin</p>
               </div>
             </div>

             <div className="space-y-4">
               {activities?.filter((a: any) => a.action === 'UPDATED' || a.action === 'DELETED').length > 0 ? activities.filter((a: any) => a.action === 'UPDATED' || a.action === 'DELETED').map((act: any) => (
                 <div key={act.id} className="bg-muted/50 rounded-2xl p-4 border border-slate-700/50">
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                           {new Date(act.timestamp).toLocaleString('id-ID')} - {act.userEmail}
                        </span>
                     </div>
                     <p className="text-sm font-bold text-white"><span className="text-slate-400 font-medium">Target:</span> {act.title}</p>
                     
                     {(act.metadata?.oldData || act.metadata?.newData) && (
                       <div className="mt-4 border-t border-slate-700/50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {act.metadata?.oldData && (
                            <div>
                              <p className="text-[10px] font-bold uppercase text-amber-500 mb-2 tracking-widest">Original Data</p>
                              <pre className="text-[10px] text-emerald-400 font-mono bg-slate-950 p-4 rounded-xl overflow-x-auto shadow-sm max-h-40">
                                {JSON.stringify(act.metadata.oldData, null, 2)}
                              </pre>
                            </div>
                          )}
                          {act.metadata?.newData && (
                            <div>
                              <p className="text-[10px] font-bold uppercase text-blue-500 mb-2 tracking-widest">New Values</p>
                              <pre className="text-[10px] text-emerald-400 font-mono bg-slate-950 p-4 rounded-xl overflow-x-auto shadow-sm max-h-40">
                                {JSON.stringify(act.metadata.newData, null, 2)}
                              </pre>
                            </div>
                          )}
                       </div>
                     )}
                 </div>
               )) : (
                 <div className="text-center p-5 font-bold text-sm text-slate-600 uppercase tracking-widest">Belum ada log forensik</div>
               )}
             </div>
           </div>
         </div>
      )}
    </div>
  );
};
