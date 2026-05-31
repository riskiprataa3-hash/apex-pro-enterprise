import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Camera, Map as MapIcon, Save, ChevronLeft, Database, 
  HardHat, Activity, LayoutDashboard, Share2, Plus, History, CloudLightning,
  Maximize2, CheckCircle2, Navigation, ArrowLeft, Info, Image as ImageIcon,
  Wifi, WifiOff, Zap, ShieldCheck, Home, Folder, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FirebaseImage } from './FirebaseImage';
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
  };  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-gray-900 dark:text-gray-100 relative z-10 w-full flex flex-col font-sans pb-28">
      
      {!selectedProjectId ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col p-6 font-sans w-full max-w-2xl mx-auto"
        >
          {/* Top Header */}
          <div className="flex justify-between items-center mb-8 mt-4">
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight font-sans">Halo, Petugas! 👋</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pilih proyek untuk memulai aktivitas</p>
             </div>
             <button 
               onClick={() => navigate('/')} 
               className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-slate-800 active:scale-95 transition-all"
             >
                <LayoutDashboard size={22} className="text-blue-600 dark:text-blue-400" />
             </button>
          </div>
          
          {/* Status Card (GoPay Inspired Banner) */}
          <div className="bg-blue-600 dark:bg-blue-900 rounded-[28px] p-6 text-white shadow-xl shadow-blue-600/20 dark:shadow-blue-950/20 mb-8 relative overflow-hidden">
             {/* decorative blob */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
             <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={20} className="text-blue-100" />
                   <span className="font-semibold text-sm tracking-wide">Status Ruang Kerja</span>
                </div>
                <div className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
                   <div className={cn("w-2 h-2 rounded-full shadow-sm", isOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
                   {isOnline ? 'Network Secured' : 'Offline Mode Active'}
                </div>
             </div>
             <p className="text-xs text-blue-50 max-w-[220px] relative z-10 leading-relaxed font-semibold mb-1">
                {isOnline ? 'Sistem terhubung ke server utama. Sinkronisasi data real-time aktif.' : 'Koneksi terputus. Data akan disimpan secara lokal terlebih dahulu.'}
             </p>
             {projectLogs.length > 0 && (
                <div className="mt-4 flex gap-2 relative z-10">
                  <div className="text-[10px] font-bold bg-white/20 px-2.5 py-1.5 rounded-lg border border-border/50">
                    {projectLogs.length} DRAFT TERTUNDA
                  </div>
                </div>
             )}
          </div>
 
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 px-1">Daftar Proyek Aktif</h2>
          <div className="space-y-3 pb-12">
            {projects.map((p: any, idx: number) => (
              <motion.button 
                key={p.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  setSelectedProjectId(p.id);
                  setCurrentProjectId(p.id);
                  setIsSafetyDone(false);
                  setActiveTab('input');
                }} 
                className="w-full bg-white dark:bg-slate-900 p-5 rounded-[24px] flex items-center gap-4 transition-all active:scale-[0.98] shadow-sm border border-gray-100 dark:border-slate-800/50 group hover:border-blue-200 dark:hover:border-blue-800"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                  <Folder size={24} className="text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-tight mb-1">{p.name}</h3>
                  <p className="text-[10px] font-semibold text-blue-600/80 dark:text-blue-400 uppercase tracking-widest">{p.category}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <ChevronLeft size={20} className="rotate-180" />
                </div>
              </motion.button>
            ))}
          </div>
 
        </motion.div>
      ) : (
        <>
          {/* Header Simple */}
          <div className="mb-6 pt-4 px-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Laporan Baru</h1>
            <p className="text-gray-400 dark:text-gray-450 text-sm">Isi data berurutan ke bawah</p>
          </div>

          <main {...swipeHandlers} className="max-w-2xl mx-auto px-4 w-full flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'input' && (
                <motion.div 
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 800, damping: 40 }}
                >
                  {!isSafetyDone ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center shadow-sm flex flex-col gap-8 mt-4 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
                          <ShieldCheck size={48} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Protokol K3</h3>
                        <p className="text-sm text-gray-400 dark:text-gray-405 leading-relaxed mb-8">
                          Pastikan Anda menggunakan Alat Pelindung Diri (APD) secara lengkap sebelum mencatat data.
                        </p>
                        <button 
                          onClick={() => setIsSafetyDone(true)} 
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 text-white font-bold rounded-2xl shadow-sm text-base"
                        >
                          Saya Siap & Memakai APD
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm flex flex-col gap-8 mb-8 border border-gray-100 dark:border-slate-800/60">
                      
                      {/* Bagian 1: Lokasi */}
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-widest mb-3 block">1. Titik Lokasi (STA)</label>
                        {currentProject?.category === 'PAINTING' ? (
                          <div className="flex items-center gap-3">
                            <input type="text" value={form.km} onChange={e => setForm({...form, km: e.target.value})} placeholder="STA Awal" className="w-full bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-150 text-base font-medium rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                            <span className="text-gray-300 dark:text-gray-700 font-bold">-</span>
                            <input type="text" value={form.kmTo} onChange={e => setForm({...form, kmTo: e.target.value})} placeholder="STA Akhir" className="w-full bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-150 text-base font-medium rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                          </div>
                        ) : (
                          <input type="text" value={form.km} onChange={e => setForm({...form, km: e.target.value})} placeholder="Contoh: 10+200 B" className="w-full bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-150 text-base font-medium rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                        )}
                        
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-widest mt-5 mb-3 block">Lajur</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['L1', 'L2', 'L3', 'B.Luar', 'B.Dlm', 'Bhu'].map(l => (
                            <button 
                              key={l} 
                              onClick={() => setForm({...form, lajur: l})}
                              className={cn(
                                "py-3 rounded-xl text-[11px] font-bold transition-all border",
                                form.lajur === l 
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" 
                                  : "bg-white dark:bg-slate-850 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                              )}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bagian 2: Dimensi (If Asphalt) */}
                      {currentProject?.category === 'ASPHALT' && (
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-widest mb-3 block">2. Dimensi & Ukuran</label>
                          <div className="grid grid-cols-3 gap-3">
                            <input type="number" placeholder="Panjang (m)" value={form.panjang} onChange={e => setForm({...form, panjang: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-150 text-sm font-medium rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                            <input type="number" placeholder="Lebar (m)" value={form.lebar} onChange={e => setForm({...form, lebar: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-150 text-sm font-medium rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                            <input type="number" placeholder="Tebal (cm)" value={form.tebal} onChange={e => setForm({...form, tebal: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-150 text-sm font-medium rounded-2xl p-4 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                          </div>
                        </div>
                      )}

                      {/* Bagian 3: Parameters */}
                      {config && (
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-widest mb-3 block">3. Detail Output</label>
                          <div className="flex flex-col gap-3">
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-wider">{config.unit1}</span>
                              <input type="text" placeholder="..." value={form.val1} onChange={e => setForm({...form, val1: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-150 text-base font-bold rounded-2xl p-4 pl-28 outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                            </div>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">{config.unit2}</span>
                              <input type="number" placeholder="0.00" value={form.val2} onChange={e => setForm({...form, val2: e.target.value})} className="w-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-lg font-black rounded-2xl p-4 pl-36 outline-none focus:ring-2 focus:ring-blue-200 transition-all border border-blue-100/50 dark:border-blue-900/30" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bagian 4: Photos */}
                      {config && (
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-widest mb-4 block flex justify-between items-center">
                            <span>4. Dokumentasi <span className="text-rose-500">*</span></span>
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {config.stages.map((stage: any) => (
                              <div key={stage.key} className="flex flex-col gap-2">
                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-455 uppercase text-center">{stage.label}</span>
                                <div className={cn("relative aspect-square rounded-[20px] flex flex-col items-center justify-center overflow-hidden transition-all", photos[stage.key] ? "bg-gray-900 border-2 border-emerald-500 shadow-md" : "bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 border-dashed hover:bg-gray-100 dark:hover:bg-slate-750")}>
                                    {photos[stage.key] ? (
                                      <>
                                        <img src={URL.createObjectURL(photos[stage.key])} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Preview"/>
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border border-white flex items-center justify-center shadow-sm">
                                          <CheckCircle2 size={10} className="text-white" />
                                        </div>
                                        <label className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer">
                                          <input type="file" accept="image/*" className="hidden" onChange={e => {
                                            const file = e.target.files?.[0];
                                            if(file) setPhotos({...photos, [stage.key]: file});
                                          }} />
                                        </label>
                                      </>
                                    ) : (
                                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer group">
                                        <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm mb-1 group-hover:scale-110 transition-transform">
                                          <Camera size={14} className="text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => {
                                          const file = e.target.files?.[0];
                                          if(file) setPhotos({...photos, [stage.key]: file});
                                        }} />
                                      </label>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bagian 5: Status & Note */}
                      <div className="pt-2 border-t border-gray-50 dark:border-slate-800">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-450 uppercase tracking-widest mb-3 block">5. Status Penyelesaian</label>
                          <div className="flex bg-gray-50 dark:bg-slate-850 p-1.5 rounded-2xl gap-1 mb-4 border border-gray-100/50 dark:border-slate-800/40">
                            <button 
                              onClick={() => setForm({...form, status: 'PROSES'})}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-[11px] font-bold uppercase transition-all tracking-wider",
                                form.status === 'PROSES' ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-slate-805" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-350"
                              )}
                            >
                              Proses
                            </button>
                            <button 
                              onClick={() => setForm({...form, status: 'SELESAI'})}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-[11px] font-bold uppercase transition-all tracking-wider",
                                form.status === 'SELESAI' ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/50 dark:border-slate-805" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-350"
                              )}
                            >
                              Selesai 100%
                            </button>
                          </div>
                          
                          <textarea 
                            value={form.note} 
                            onChange={e => setForm({...form, note: e.target.value})} 
                            placeholder="Catatan kendala lapangan..." 
                            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm font-medium text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px] resize-none placeholder:text-gray-405 dark:placeholder:text-gray-500"
                          />
                      </div>
                    </div>
                  )}
 
                  {/* Submit Action */}
                  {isSafetyDone && (
                    <div className="pt-4 pb-8">
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave} 
                        className="w-full bg-blue-600 text-white font-bold py-5 rounded-[24px] shadow-lg shadow-blue-600/30 flex items-center justify-center gap-3 hover:bg-blue-700 transition-colors uppercase tracking-widest text-sm"
                      >
                        <Save size={18} />
                        <span>Simpan ke Draft Lokal</span>
                      </motion.button>
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed font-semibold">
                        Data akan disimpan di dalam perangkat (Offline).<br/> Lakukan sinkronisasi ke server melalui menu <b className="text-gray-750 dark:text-gray-300">Data</b>.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
 
              {activeTab === 'data' && (
                <motion.div 
                  key="data"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: "spring", stiffness: 800, damping: 40 }}
                  className="space-y-6 pb-20 mt-4"
                >
                  {projectLogs.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] shadow-sm border border-gray-100 dark:border-slate-800/50">
                      <div className="flex items-start gap-4 mb-5">
                         <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center shrink-0">
                           <Database size={24} />
                         </div>
                         <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Menunggu Sinkronisasi</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Ada {projectLogs.length} data laporan lokal yang belum diunggah ke server.</p>
                         </div>
                      </div>
                      <button
                        disabled={isSyncing}
                        onClick={handleSyncData}
                        className={cn(
                          "w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                          isOnline 
                            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 text-xs shadow-md shadow-blue-600/20" 
                            : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed text-xs border border-gray-200 dark:border-slate-700"
                        )}
                      >
                        {isSyncing ? <Activity size={18} className="animate-spin" /> : <CloudLightning size={18} />}
                        {isSyncing ? "Mengirim Data..." : `Sinkronkan Semua Sekarang`}
                      </button>
                    </div>
                  )}
                  
                  {projectLogs.length === 0 ? (
                    <div className="text-center py-32 space-y-4 px-6 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 dark:from-blue-950/25 via-transparent to-transparent opacity-50 z-0 pl-16 pt-16"></div>
                      <div className="bg-white dark:bg-slate-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-50 dark:border-slate-800 relative z-10">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Semua Tersinkronisasi</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Tidak ada data tertunda di perangkat Anda. Kerja bagus!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-widest ml-2 flex items-center gap-2">
                        <History size={14} /> Daftar Antrean ({projectLogs.length})
                      </h3>
                      {projectLogs.map((log: any) => (
                        <div 
                          key={log.id} 
                          className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 p-5 rounded-[24px] shadow-sm relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 tracking-tight font-sans">KM {log.km} {log.kmTo && `- ${log.kmTo}`}</h4>
                              <div className="flex gap-2 mt-2">
                                <span className="text-[10px] font-bold px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-lg uppercase border border-gray-200 dark:border-slate-700">Lajur {log.lajur}</span>
                                <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase border", log.status === 'SELESAI' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-850" : "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-850")}>
                                  {log.status === 'SELESAI' ? '100% Selesai' : 'Sedang Proses'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-lg block mb-1">
                                {new Date(log.timestamp).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                            {['p1', 'p50', 'p100'].map((k, i) => log.photos[k] && (
                              <div key={k} className="w-16 h-16 rounded-[14px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 overflow-hidden shrink-0 snap-start relative">
                                 <img src={URL.createObjectURL(log.photos[k])} className="w-full h-full object-cover" alt="Thumb" />
                                 <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 rounded-md backdrop-blur-sm font-bold">
                                   {i === 0 ? '0%' : (i === 1 ? '50%' : '100%')}
                                 </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
 
                  {syncedEntries.length > 0 && (
                    <div className="pt-6 space-y-4">
                      <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-widest flex items-center gap-2">
                          <CloudLightning size={14} /> Sinkronisasi Sukses Hari Ini
                        </h3>
                      </div>
                      {syncedEntries.map((entry: any) => (
                        <div key={entry.id} className="bg-white/60 dark:bg-slate-900/60 border border-gray-200/50 dark:border-slate-800/80 p-4 rounded-[20px] flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                               <CheckCircle2 size={16} />
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-gray-800 dark:text-gray-150 font-sans">KM {entry.km} {entry.kmTo && `- ${entry.kmTo}`}</h4>
                               <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-450 uppercase tracking-widest mt-0.5">Lajur {entry.lajur || '-'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </>
      )}
 
      {/* ========================================= */}
      {/* BOTTOM NAVIGATION BAR GAYA GOPAY          */}
      {/* ========================================= */}
      {selectedProjectId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.4)] z-50 px-6 max-w-2xl mx-auto border-t border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center h-[76px] relative">
            {/* Menu Kiri */}
            <div className="flex w-full justify-between items-center">
              <button 
                onClick={() => { setSelectedProjectId(null); setActiveTab('input'); }}
                className={cn("flex flex-col items-center gap-1.5 transition-colors w-1/3")}
              >
                <div className={cn("p-1.5 rounded-full transition-colors", !selectedProjectId ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-450")}>
                  <Home size={22} className={!selectedProjectId ? "fill-current" : ""} />
                </div>
                <span className={cn("text-[10px] font-bold", !selectedProjectId ? "text-blue-600" : "text-gray-400 dark:text-gray-500")}>Beranda</span>
              </button>
 
              <button 
                onClick={() => { if (selectedProjectId) setActiveTab('input'); }}
                className={cn("flex flex-col items-center gap-1.5 transition-colors w-1/3 relative", 
                  activeTab === 'input' && selectedProjectId ? "text-blue-600" : "text-gray-400 hover:text-blue-600 dark:hover:text-blue-450",
                  !selectedProjectId && "opacity-50 cursor-not-allowed")}
              >
                <div className="absolute -top-6 bg-blue-600 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] border-4 border-[#F8F9FA] dark:border-slate-900">
                  <Plus size={28} />
                </div>
                <span className={cn("text-[10px] font-bold mt-10", activeTab === 'input' && selectedProjectId ? "text-blue-600" : "text-gray-400 dark:text-gray-500")}>Lapor</span>
              </button>
 
              <button 
                onClick={() => { if (selectedProjectId) setActiveTab('data'); }}
                className={cn("flex flex-col items-center gap-1.5 transition-colors w-1/3 relative", 
                  activeTab === 'data' && selectedProjectId ? "text-blue-600" : "text-gray-400 hover:text-blue-600 dark:hover:text-blue-450",
                  !selectedProjectId && "opacity-50 cursor-not-allowed")}
              >
                {projectLogs.length > 0 && (
                  <div className="absolute top-0 right-1/4 translate-x-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                     <span className="text-[8px] font-bold text-white">{projectLogs.length}</span>
                  </div>
                )}
                <div className={cn("p-1.5 rounded-full transition-colors", activeTab === 'data' ? "bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500")}>
                  <Folder size={22} className={activeTab === 'data' ? "fill-current" : ""} />
                </div>
                <span className={cn("text-[10px] font-bold", activeTab === 'data' ? "text-blue-600" : "text-gray-400 dark:text-gray-500")}>Data Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
