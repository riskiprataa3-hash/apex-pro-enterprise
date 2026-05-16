import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Camera, Map as MapIcon, Save, ChevronLeft, Database, 
  HardHat, Activity, LayoutDashboard, Share2, Plus, History, CloudLightning,
  Maximize2, CheckCircle2, Navigation, ArrowLeft, Info, Image as ImageIcon,
  Wifi, WifiOff, Zap, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useSwipeable } from 'react-swipeable';

import { useApp } from '../context/AppContext';
import { ApexLogo } from './ui/ApexLogo';

// ==========================================
// 1. UTILS
// ==========================================
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

// ==========================================
// 1. CONFIGURATION (Logic per Kategori)
// ==========================================
const PROJECT_CONFIGS: any = {
  INLET: {
    name: "Inlet Drainase HK",
    unit1: "Ukuran Inlet",
    unit2: "Realisasi (PCS/QTY)",
    stages: [
      { label: "0%", desc: "Belum", key: "p1" },
      { label: "50%", desc: "Proses", key: "p50" },
      { label: "100%", desc: "Finishing", key: "p100" }
    ],
    theme: "text-emerald-500"
  },
  ASPHALT: {
    name: "Pengaspalan Hotmix",
    unit1: "Tonnage (t)",
    unit2: "Volume (m³)",
    stages: [
      { label: "Awal", desc: "Base Case", key: "p1" },
      { label: "Proses", desc: "Gelar", key: "p50" },
      { label: "Final", desc: "Selesai", key: "p100" }
    ],
    theme: "text-amber-500"
  },
  PAINTING: {
    name: "Markah Jalan",
    unit1: "Luas (m²)",
    unit2: "Pemakaian Cat (Kg)",
    stages: [
      { label: "Marking", desc: "Pra-Cat", key: "p1" },
      { label: "Coating", desc: "Proses", key: "p50" },
      { label: "Selesai", desc: "Final", key: "p100" }
    ],
    theme: "text-blue-500"
  },
  'TRAFFIC-SIGN': {
    name: "Rambu Lalu Lintas",
    unit1: "Tipe Rambu",
    unit2: "Realisasi (PCS/QTY)",
    stages: [
      { label: "0%", desc: "Persiapan", key: "p1" },
      { label: "50%", desc: "Pondasi", key: "p50" },
      { label: "100%", desc: "Ereksi", key: "p100" }
    ],
    theme: "text-purple-500"
  },
  PLANTING: {
    name: "Penghijauan",
    unit1: "Jenis Bibit",
    unit2: "Realisasi (PCS/QTY)",
    stages: [
      { label: "0%", desc: "Belum", key: "p1" },
      { label: "50%", desc: "Tanam", key: "p50" },
      { label: "100%", desc: "Selesai", key: "p100" }
    ],
    theme: "text-emerald-600"
  },
  OTHER: {
    name: "Lainnya",
    unit1: "Parameter 1",
    unit2: "Parameter 2",
    stages: [
      { label: "0%", desc: "Awal", key: "p1" },
      { label: "50%", desc: "Proses", key: "p50" },
      { label: "100%", desc: "Selesai", key: "p100" }
    ],
    theme: "text-gray-500"
  }
};

// ==========================================
// 2. STATE MANAGEMENT (Database Lokal)
// ==========================================
const LiteContext = createContext<any>(null);

const LiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { projects: realProjects } = useApp();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const projects = useMemo(() => {
    return realProjects.map(p => ({
      id: p.id,
      name: p.name,
      category: p.type?.toUpperCase() || 'OTHER'
    }));
  }, [realProjects]);

  const [logs, setLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('tg_logs_v6');
    return saved ? JSON.parse(saved) : [];
  });

  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('tg_logs_v6', JSON.stringify(logs));
    if (navigator.geolocation && !location) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, null, { enableHighAccuracy: true });
    }
  }, [logs, location]);

  const addLog = (log: any) => setLogs([{ ...log, id: Date.now(), timestamp: new Date() }, ...logs]);

  const removeLog = (id: any) => setLogs(logs.filter(l => l.id !== id));

  return (
    <LiteContext.Provider value={{ projects, logs, addLog, location, removeLog, isOnline }}>
      {children}
    </LiteContext.Provider>
  );
};

// ==========================================
// 3. UI COMPONENTS
// ==========================================

const TollGuardLite = () => {
  const navigate = useNavigate();
    const { compressImage, handleAddEntryManual, projects: realProjects, entries: realEntries, setCurrentProjectId } = useApp();

  const { projects, logs, addLog, location, removeLog, isOnline } = useContext(LiteContext);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('input');
  const [isSyncing, setIsSyncing] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setActiveTab('data'),
    onSwipedRight: () => setActiveTab('input'),
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 100
  });
  
  // State Form
  const [form, setForm] = useState({ 
    km: '', 
    kmTo: '',
    lajur: 'L1',
    panjang: '',
    lebar: '',
    tebal: '',
    val1: '', 
    val2: '', 
    note: '', 
    status: 'PROSES' 
  });
  const [photos, setPhotos] = useState<any>({ p1: null, p50: null, p100: null });
  const [isSafetyDone, setIsSafetyDone] = useState(false);

  const currentProject = useMemo(() => 
    projects.find((p: any) => p.id === selectedProjectId), [selectedProjectId, projects]
  );

  const lastKM = useMemo(() => {
    if (!realEntries || !realEntries.length) return null;
    const sorted = [...realEntries].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const project = realProjects.find(p => p.id === selectedProjectId);
    if (project?.type === 'painting') return sorted[0]?.kmTo;
    return sorted[0]?.km;
  }, [realEntries, selectedProjectId, realProjects]);
  
  const config = currentProject ? PROJECT_CONFIGS[currentProject.category] : null;
  const projectLogs = logs.filter((l: any) => l.projectId === selectedProjectId);
  
  const syncedEntries = useMemo(() => {
    if (!realEntries || !selectedProjectId) return [];
    const today = new Date().toLocaleDateString('id-ID');
    return realEntries
      .filter((e: any) => 
        e.projectId === selectedProjectId && 
        new Date(e.timestamp).toLocaleDateString('id-ID') === today
      )
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [realEntries, selectedProjectId]);

  const handleSyncData = async () => {
    if (!isOnline) {
       alert("Koneksi diperlukan untuk sinkronisasi ke cloud.");
       return;
    }
    if (projectLogs.length === 0) return;

    if (confirm(`Sinkronkan ${projectLogs.length} data ke server? Data yang berhasil disinkronkan akan dihapus dari penyimpanan lokal.`)) {
      setIsSyncing(true);
      let count = 0;
      for (const log of projectLogs) {
        try {
          const entryData: any = {
            km: log.km,
            kmTo: log.kmTo || '',
            lajur: log.lajur || 'L1',
            description: log.note || '',
            status: log.status?.toLowerCase() === 'selesai' ? 'completed' : 'in-progress',
            timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp).getTime() : log.timestamp instanceof Date ? log.timestamp.getTime() : log.timestamp,
            latitude: log.location?.lat,
            longitude: log.location?.lng,
            photos0: log.photos.p1 ? [log.photos.p1] : [],
            photos50: log.photos.p50 ? [log.photos.p50] : [],
            photos100: log.photos.p100 ? [log.photos.p100] : []
          };

          const pRaw = realProjects.find(p => p.id === log.projectId);
          if (pRaw?.type === 'asphalt') {
            entryData.panjang = parseFloat(log.panjang) || 0;
            entryData.lebar = parseFloat(log.lebar) || 0;
            entryData.tebal = parseFloat(log.tebal) || 0;
            entryData.tonase = parseFloat(log.val1) || 0;
            entryData.volume = parseFloat(log.val2) || 0;
          } else {
            entryData.qty = parseFloat(log.val2) || 0;
            if (pRaw?.type === 'planting') entryData.plantType = log.val1;
            else entryData.signType = log.val1;
          }

          await handleAddEntryManual(log.projectId, entryData);
          removeLog(log.id);
          count++;
        } catch (e) {
          console.error("Sync failed for log", log.id, e);
        }
      }
      setIsSyncing(false);
      alert(`Sinkronisasi selesai: ${count} data berhasil diunggah.`);
    }
  };

  const handleSave = async () => {
        if (!form.km || !photos.p1) {
            alert("KM dan Foto Tahap 1 wajib diisi!");
            return;
        }
        if (currentProject.category === 'PAINTING' && !form.kmTo) {
            alert("KM Akhir wajib diisi!");
            return;
        }
    
    const processedPhotos: any = {};
    const compressPromises: Promise<void>[] = [];

    ['p1', 'p50', 'p100'].forEach(key => {
        if (photos[key]) {
            compressPromises.push(
                compressImage(photos[key]).then(res => {
                    processedPhotos[key] = res;
                }).catch(err => {
                    processedPhotos[key] = null;
                })
            );
        }
    });

    try {
        await Promise.all(compressPromises);
        addLog({
            projectId: selectedProjectId,
            category: currentProject.category,
            ...form,
            photos: processedPhotos,
            location
        });
        alert("Terarsip di Lokal!");
        setForm({ km: '', kmTo: '', lajur: 'L1', panjang: '', lebar: '', tebal: '', val1: '', val2: '', note: '', status: 'PROSES' });
        setPhotos({ p1: null, p50: null, p100: null });
        setActiveTab('data');
    } catch(e) {
        alert("Gagal memproses. Coba lagi.");
    }
  };

  if (!selectedProjectId) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="min-h-screen text-foreground p-8 relative z-10 w-full"
      >
        <header className="mb-12 relative max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <ApexLogo className="w-14 h-14" />
            <div>
               <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Toll-Guard<br/><span className="text-primary">Lite.</span></h1>
               <div className="flex items-center gap-2 mt-1">
                  {isOnline ? (
                    <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Wifi size={8} className="text-emerald-500" />
                      <span className="text-[7px] font-black uppercase text-emerald-500">Online</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <WifiOff size={8} className="text-rose-500" />
                      <span className="text-[7px] font-black uppercase text-rose-500">Offline</span>
                    </div>
                  )}
               </div>
            </div>
          </div>
          <button 
             onClick={() => navigate('/')} 
             className="p-4 bg-background/20 hover:bg-background/40 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 transition-all shadow-xl active:scale-90"
          >
             <LayoutDashboard size={20} />
          </button>
        </header>

        <div className="grid gap-4 max-w-2xl mx-auto">
          {projects.map((p: any, idx: number) => (
            <motion.button 
              key={p.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                setSelectedProjectId(p.id);
                setCurrentProjectId(p.id);
                setIsSafetyDone(false);
              }} 
              className="group bg-background/20 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-xl p-8 rounded-[2.5rem] flex justify-between items-center hover:bg-primary/10 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Zap className="w-20 h-20 rotate-12" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black italic uppercase group-hover:text-primary transition-colors tracking-tighter leading-none mb-1">{p.name}</h3>
                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">{p.category} MANAGEMENT</p>
              </div>
              <Plus className="group-hover:text-primary transition-colors relative z-10" />
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen text-foreground relative z-10 w-full flex flex-col">
      <nav className="sticky top-4 z-50 bg-background/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 px-6 py-4 flex items-center justify-between rounded-[2rem] mx-4 shadow-2xl max-w-2xl sm:mx-auto">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedProjectId(null)} className="p-3 bg-background/20 rounded-xl hover:bg-background/40 transition-all active:scale-90 border border-white/10"><ChevronLeft size={18}/></button>
          <div>
            <h2 className="text-[10px] font-black uppercase italic tracking-tighter leading-none">{currentProject.name}</h2>
            {lastKM && (
              <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mt-1">Last Recorded: {lastKM}</p>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnline ? "bg-emerald-500" : "bg-rose-500")} />
              <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{isOnline ? 'Cloud Synced' : 'Local Archive Only'}</span>
            </div>
          </div>
        </div>
        <div className="p-3 bg-primary/10 rounded-xl text-primary font-black italic text-xs tracking-tighter">APEX PRO</div>
      </nav>

      <div className="flex p-4 gap-2 max-w-2xl mx-auto w-full">
        {['input', 'data'].map((t) => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              "flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all",
              activeTab === t ? "bg-primary text-black shadow-lg shadow-primary/20" : "bg-white/5 text-slate-500 hover:bg-white/10"
            )}
          >
            {t === 'input' ? 'Parameter Port' : 'Data Vault'}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-4">
      </div>

      <main {...swipeHandlers} className="max-w-2xl mx-auto p-6 pb-24 w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-8 will-change-transform"
            >
              {!isSafetyDone ? (
                <div className="bg-amber-500/5 border border-amber-500/20 p-10 rounded-[4rem] text-center space-y-6">
                  <div className="bg-amber-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500/30">
                    <HardHat size={48} className="text-amber-500" />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Protokol Keamanan</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Wajib Menggunakan APD Lengkap Sebelum Interaksi di Lokasi Pekerjaan. Keselamatan adalah Prioritas Utama.</p>
                  <button 
                    onClick={() => setIsSafetyDone(true)} 
                    className="w-full py-5 bg-amber-500 hover:bg-amber-400 transition-all active:scale-95 text-black font-black uppercase rounded-2xl tracking-[0.2em]"
                  >
                    Konfirmasi Keamanan
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {currentProject.category === 'PAINTING' ? (
                      <div className="col-span-2 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                           <label className="text-[7px] font-black uppercase text-slate-500 tracking-widest pl-1">KM Awal</label>
                           <input type="text" value={form.km} onChange={e => setForm({...form, km: e.target.value})} placeholder="KM 10+200" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-black italic focus:border-primary outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[7px] font-black uppercase text-slate-500 tracking-widest pl-1">KM Akhir</label>
                           <input type="text" value={form.kmTo} onChange={e => setForm({...form, kmTo: e.target.value})} placeholder="KM 10+500" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-black italic focus:border-primary outline-none transition-all" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Lokasi (KM / STA)</label>
                        <input type="text" value={form.km} onChange={e => setForm({...form, km: e.target.value})} placeholder="KM 10+200 A" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-black italic focus:border-primary outline-none transition-all" />
                      </div>
                    )}
                    
                    <div className="space-y-2 col-span-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Identifikasi Lajur</label>
                       <div className="grid grid-cols-6 gap-2">
                         {['L1', 'L2', 'L3', 'B.Luar', 'B.Dlm', 'Bhu'].map(l => (
                           <button 
                             key={l} 
                             onClick={() => setForm({...form, lajur: l})}
                             className={cn(
                               "py-3 rounded-xl text-[8px] font-black border transition-all",
                               form.lajur === l ? "bg-primary text-black border-primary" : "bg-white/5 border-white/10 text-slate-500"
                             )}
                           >
                              {l}
                           </button>
                         ))}
                       </div>
                    </div>

                    {currentProject.category === 'ASPHALT' && (
                      <div className="col-span-2 grid grid-cols-3 gap-3 bg-muted/20 p-4 rounded-3xl border border-border">
                         <div className="space-y-1">
                            <span className="text-[7px] font-black text-slate-500 uppercase block text-center">Panjang (m)</span>
                            <input type="number" value={form.panjang} onChange={e => setForm({...form, panjang: e.target.value})} className="w-full bg-background border-none rounded-xl text-center font-black italic p-3 text-lg" />
                         </div>
                         <div className="space-y-1">
                            <span className="text-[7px] font-black text-slate-500 uppercase block text-center">Lebar (m)</span>
                            <input type="number" value={form.lebar} onChange={e => setForm({...form, lebar: e.target.value})} className="w-full bg-background border-none rounded-xl text-center font-black italic p-3 text-lg" />
                         </div>
                         <div className="space-y-1">
                            <span className="text-[7px] font-black text-slate-500 uppercase block text-center">Tebal (cm)</span>
                            <input type="number" value={form.tebal} onChange={e => setForm({...form, tebal: e.target.value})} className="w-full bg-background border-none rounded-xl text-center font-black italic p-3 text-lg" />
                         </div>
                      </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">{config.unit1}</label>
                       <input type="text" value={form.val1} onChange={e => setForm({...form, val1: e.target.value})} placeholder="Parameter" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-black focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">{config.unit2}</label>
                       <input type="number" value={form.val2} onChange={e => setForm({...form, val2: e.target.value})} placeholder="0.00" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-black focus:border-primary outline-none transition-all" />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Status Pengerjaan</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setForm({...form, status: 'PROSES'})} 
                          className={cn(
                            "py-5 rounded-2xl text-[9px] font-black border transition-all flex items-center justify-center gap-2",
                            form.status === 'PROSES' ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                          )}
                        >
                          <Activity size={12} /> PROSES
                        </button>
                        <button 
                          onClick={() => setForm({...form, status: 'SELESAI'})} 
                          className={cn(
                            "py-5 rounded-2xl text-[9px] font-black border transition-all flex items-center justify-center gap-2",
                            form.status === 'SELESAI' ? "bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                          )}
                        >
                          <CheckCircle2 size={12} /> SELESAI
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Catatan</label>
                      <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="Detail kendala atau catatan lapangan..." className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-xs font-medium focus:border-primary outline-none resize-none h-24 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Dokumentasi</label>
                    <div className="grid grid-cols-3 gap-3">
                      {config.stages.map((stage: any) => (
                        <div key={stage.key} className={cn("relative aspect-square rounded-[2rem] flex flex-col items-center justify-center border-2 overflow-hidden transition-all", photos[stage.key] ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" : "border-dashed border-white/10 bg-white/5 hover:bg-white/10")}>
                          {photos[stage.key] ? (
                            <>
                              <img src={URL.createObjectURL(photos[stage.key])} className="absolute inset-0 w-full h-full object-cover" alt="Preview"/>
                              <label className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer">
                                <ImageIcon size={20} className="mb-1" />
                                <span className="text-[8px] font-black uppercase">Ganti</span>
                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                  const file = e.target.files?.[0];
                                  if(file) setPhotos({...photos, [stage.key]: file});
                                }} />
                              </label>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2 w-full px-4 text-center">
                              <span className="text-[8px] font-black uppercase text-primary mb-1 tracking-tighter">{stage.label}</span>
                              <div className="flex w-full gap-2 px-1">
                                <label className="flex-1 flex flex-col items-center justify-center bg-black/20 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-transform">
                                   <Camera className="w-4 h-4 text-primary" />
                                   <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => {
                                     const file = e.target.files?.[0];
                                     if(file) setPhotos({...photos, [stage.key]: file});
                                   }} />
                                </label>
                                <label className="flex-1 flex flex-col items-center justify-center bg-black/20 py-2.5 rounded-xl cursor-pointer active:scale-95 transition-transform">
                                   <ImageIcon className="w-4 h-4 text-emerald-500" />
                                   <input type="file" accept="image/*" className="hidden" onChange={e => {
                                     const file = e.target.files?.[0];
                                     if(file) setPhotos({...photos, [stage.key]: file});
                                   }} />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave} 
                    className="w-full py-6 bg-primary hover:bg-primary/90 transition-all text-black rounded-3xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-10 shadow-2xl shadow-primary/20"
                  >
                    <Save size={20} /> Arsip ke Vault
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'data' && (
            <motion.div 
              key="data"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4 will-change-transform"
            >
              {projectLogs.length > 0 && (
                <div className="mb-8">
                  <button
                    disabled={isSyncing}
                    onClick={handleSyncData}
                    className={cn(
                      "w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl",
                      isOnline ? "bg-emerald-500 text-black shadow-emerald-500/20 active:scale-95" : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSyncing ? (
                      <Activity size={24} className="animate-spin" />
                    ) : (
                      <CloudLightning size={24} />
                    )}
                    {isSyncing ? "Initializing..." : "Transmit to Cloud"}
                  </button>
                </div>
              )}
              
              {projectLogs.length === 0 ? (
                <div className="text-center py-32 opacity-20 space-y-4">
                  <Database size={64} className="mx-auto" />
                  <p className="text-xs font-black uppercase tracking-[0.5em]">No Local Vaults</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-6">
                    <Database size={12} className="text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Local Queue ({projectLogs.length})</span>
                  </div>
                  {projectLogs.map((log: any, i: number) => (
                    <motion.div 
                      key={log.id} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-background/20 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative border-l-4 border-l-primary"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                           <h4 className="text-2xl font-black italic uppercase tracking-tighter text-primary">
                             KM {log.km} {log.kmTo && `- ${log.kmTo}`}
                           </h4>
                           <p className="text-[8px] font-bold text-slate-500 uppercase mt-1">Lajur: {log.lajur}</p>
                        </div>
                        <span className="text-[8px] font-black bg-white/5 px-2 py-1 rounded-full text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-black/40 p-4 rounded-xl">
                          <span className="text-[7px] uppercase font-black text-slate-500 block">Param</span>
                          <span className="text-xs font-black truncate">{log.val1 || '-'}</span>
                        </div>
                        <div className="bg-black/40 p-4 rounded-xl">
                          <span className="text-[7px] uppercase font-black text-slate-500 block">Delta Qty</span>
                          <span className="text-sm font-black text-primary italic">{log.val2 || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {['p1', 'p50', 'p100'].map(k => log.photos[k] && (
                          <div key={k} className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0">
                             <img src={log.photos[k]} className="w-full h-full object-cover" alt="Progress" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {syncedEntries.length > 0 && (
                <div className="pt-8 space-y-4">
                  <div className="flex items-center gap-2 px-6">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Cloud Synced Today ({syncedEntries.length})</span>
                  </div>
                  {syncedEntries.map((entry: any) => (
                    <div key={entry.id} className="bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/10 p-6 rounded-[2.5rem] relative opacity-60">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                           <h4 className="text-xl font-black italic uppercase tracking-tighter text-emerald-500">
                             KM {entry.km} {entry.kmTo && `- ${entry.kmTo}`}
                           </h4>
                           <p className="text-[7px] font-bold text-slate-500 uppercase mt-1">Lajur: {entry.lajur || '-'}</p>
                        </div>
                        <span className="text-[7px] font-black bg-emerald-500/10 px-2 py-1 rounded-full text-emerald-600">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function LiteModePage() {
  return (
    <LiteProvider>
      <TollGuardLite />
    </LiteProvider>
  );
}
