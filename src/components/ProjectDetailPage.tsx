import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  
  Plus, 
  Search, 
  ArrowLeft, 
  Database, 
  FileSpreadsheet,
  FileText,
  Calculator,
  Camera,
  BarChart3,
  ChevronRight,
  Maximize2,
  TrendingUp,
  MapPin,
  Trash2,
  Save,
  Activity,
  Info,
  Circle,
  X,
  Edit,
  Pencil,
  CheckCircle2,
  Archive,
  ArchiveX,
  Navigation,
  Globe,
  BarChart3 as BarChart3Icon,
  Image as ImageIcon,
  Calendar,
  Download,
  Sparkles,
  RefreshCw
, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Button, Card, Input, cn, Modal } from './ui/Base';
import { useSwipeable } from 'react-swipeable';
import { exportToPDF, exportCombinedPDF } from '../utils/pdfExport';
import { exportDailyExcel, exportCombinedDailyExcel } from '../utils/excelExport';
import { FirebaseImage } from './FirebaseImage';

const ProjectDetailPage: React.FC = () => {
  const { 
    currentProjectId, setCurrentProjectId, currentProject,
    errors, km, setKm, kmTo, setKmTo, signType, setSignType, plantType, setPlantType, qty, setQty,
    entryStatus, setEntryStatus, entryDesc, setEntryDesc,
    lajurDropdown, setLaneDropdown, lajurManual, setLaneManual,
    density, setDensity, panjang, setLength,
    lebar, setWidth, tebal, setThickness, location,
    photos0, setPhotos0, photos50, setPhotos50, photos100, setPhotos100, uploadingPhotos, isEntryArchived, setIsEntryArchived, removePhoto, handleFileUpload, handleAddEntry, resetEntryForm,
    isUploading, entries, searchQuery, setSearchQuery, startDate, endDate,
    isAddingEntry, setStartDate, setEndDate, setFilterLane, filterArah, setFilterArah, filterRanting, setFilterRanting,
    filteredEntries, totalTonase, totalVolume,
    selectedEntryPhotos, setSelectedEntryPhotos, handleDeleteEntry, exportExcel, handleRemoveDuplicateEntries,
    materialType, setMaterialType, user, isAdmin, isAudit, isDarkMode,
    equipmentUsed, setEquipmentUsed, equipmentList,
    editingEntryId, handleEditEntry,
    showArchived, setShowArchived, handleArchiveEntry, generateAISummary
  } = useApp();
  
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<any>(() => {
    return localStorage.getItem('shaka_project_last_tab') || 'input';
  });
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const confirmDeleteEntry = (id: string) => {
    setEntryToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDeleteEntry = () => {
    if (entryToDelete) {
      handleDeleteEntry(entryToDelete);
    }
    setDeleteConfirmOpen(false);
    setEntryToDelete(null);
  };

  useEffect(() => {
    localStorage.setItem('shaka_project_last_tab', activeTab);
  }, [activeTab]);

  const rawTabsList = [
    { id: 'input', label: 'Input' },
    { id: 'data', label: 'Data' },
    { id: 'report', label: 'Daily' },
    { id: 'analytics', label: 'Analytics' },
  ];
  const tabsList = isAudit ? rawTabsList.filter(t => t.id !== 'input') : rawTabsList;

  // Ensure activeTab is valid for audit user
  useEffect(() => {
    if (isAudit && activeTab === 'input') {
      setActiveTab('data');
    }
  }, [isAudit, activeTab]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const currentIndex = tabsList.findIndex(i => i.id === activeTab);
      if (currentIndex !== -1 && currentIndex < tabsList.length - 1) setActiveTab(tabsList[currentIndex + 1].id);
    },
    onSwipedRight: () => {
      const currentIndex = tabsList.findIndex(i => i.id === activeTab);
      if (currentIndex > 0) setActiveTab(tabsList[currentIndex - 1].id);
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 100
  });
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signatureRole, setSignatureRole] = useState("");
  const [visibleCount, setVisibleCount] = useState(25);

  const handleGenerateSummary = async () => {
    setIsGeneratingAI(true);
    const summary = await generateAISummary(entries);
    setAiSummary(summary);
    setIsGeneratingAI(false);
  };

  const entriesByDate = useMemo(() => {
    const groups: Record<string, any[]> = {};
    (filteredEntries || []).forEach(e => {
      if (e.isArchived) return; // ignore archived items in daily reports
      const d = new Date(e.timestamp);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([dateKey, items]) => {
          const sortedItems = [...items].sort((a, b) => {
             const kmA = a.km || '';
             const kmB = b.km || '';
             const isA1 = kmA.toUpperCase().includes('A/OS');
             const isB1 = kmA.toUpperCase().includes('B/OS');
             const isA2 = kmB.toUpperCase().includes('A/OS');
             const isB2 = kmB.toUpperCase().includes('B/OS');
             
             if (isA1 && !isA2) return -1;
             if (!isA1 && isA2) return 1;
             if (isB1 && !isB2) return 1;
             if (!isB1 && isB2) return -1;
             
             return kmA.localeCompare(kmB);
          });
          
          return { 
              dateKey, 
              dateDisplay: new Date(dateKey.replace(/-/g, '/')).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
              entries: sortedItems 
          };
      });
  }, [filteredEntries]);

  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      setCurrentProjectId(projectId);
    }
  }, [projectId, currentProjectId, setCurrentProjectId]);

  const timeSeriesData = useMemo(() => {
    const groups: Record<string, { tonase: number; qty: number; date: string; rawDate: string }> = {};
    (filteredEntries || []).forEach(e => {
      const dateObj = new Date(e.timestamp);
      const d = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      if (!groups[d]) {
        groups[d] = { 
          tonase: 0, 
          qty: 0, 
          date: new Date(d.replace(/-/g, '/')).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          rawDate: d
        };
      }
      groups[d].tonase += Number(e.tonase) || 0;
      groups[d].qty += Number(e.qty) || 0;
    });
    return Object.values(groups).sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  }, [filteredEntries]);

  const lajurTonnageData = useMemo(() => {
    const stats: Record<string, number> = {};
    (filteredEntries || []).forEach(e => {
      if (e.lajur) {
        stats[e.lajur] = (stats[e.lajur] || 0) + (Number(e.tonase) || 0);
      }
    });
    return Object.entries(stats).map(([name, value]) => ({ 
      name, 
      value: parseFloat(value.toFixed(2)),
      count: (filteredEntries || []).filter(en => en.lajur === name).length
    }));
  }, [filteredEntries]);

  const chartData = useMemo(() => {
    return (filteredEntries || []).slice(-15).map((e, i) => ({
      index: i + 1,
      tonase: parseFloat((e.tonase || 0).toFixed(4)),
      volume: parseFloat((e.volume || 0).toFixed(4)),
      qty: parseFloat((e.qty || 0).toFixed(4)),
      km: e.km || ''
    }));
  }, [filteredEntries]);

  const lajurStats = useMemo(() => {
    const stats: Record<string, number> = {};
    (filteredEntries || []).forEach(e => {
        if (e.lajur) stats[e.lajur] = (stats[e.lajur] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [filteredEntries]);

  const lastKM = useMemo(() => {
    if (!entries || !entries.length) return null;
    const sorted = [...entries].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    if (currentProject?.type === 'painting') return sorted[0]?.kmTo;
    return sorted[0]?.km;
  }, [entries, currentProject?.type]);

  const COLORS = ['#F43F5E', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
  
  const realizationStats = useMemo(() => {
    const target = currentProject?.targetQty || 0;
    const isPekanbaruDumai = currentProject?.name?.toUpperCase()?.includes('PEKANBARU-DUMAI') && currentProject?.type === 'inlet';
    
    const dbEntriesQty = (entries || []).reduce((sum, e) => {
      if (e.isArchived) return sum;
      if (currentProject?.type === 'asphalt') {
        return sum + (Number(e.tonase) || 0);
      }
      return sum + (Number(e.qty) || 0);
    }, 0);

    const manualAddition = 0;
    const realized = dbEntriesQty + manualAddition;
    
    const remaining = Math.max(0, target - realized);
    const percentage = target > 0 ? (realized / target) * 100 : 0;
    
    return { target, realized, remaining, percentage, isPekanbaruDumai, manualAddition };
  }, [entries, currentProject]);

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-5 text-center">
        <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
           className="w-10 h-10 border border-primary border-t-transparent rounded-full mb-8" 
        />
        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Syncing Database Hub...</p>
      </div>
    );
  }

  const volumeVal = ((parseFloat(panjang) || 0) * (parseFloat(lebar) || 0) * ((parseFloat(tebal) || 0) / 100));
  const tonnageVal = volumeVal * (parseFloat(density) || 0);

  const baseRealization = filteredEntries.reduce((sum, e) => sum + (Number(e.qty) || 0), 0);
  const isPekanbaruDumaiInlet = currentProject?.name?.toUpperCase()?.includes('PEKANBARU-DUMAI') && currentProject?.type === 'inlet';
  
  const totalDbActive = (entries || []).filter(e => !e.isArchived).length;
  const isFiltered = filteredEntries.length !== totalDbActive;
  
  const dynamicsOffset = 0;
  const finalRealizationStr = (baseRealization + dynamicsOffset).toFixed(0);

  return (
    <>
      {selectedEntryPhotos && (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-border">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-bold text-sm">Photo Details - KM {selectedEntryPhotos.km}</h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedEntryPhotos(null)} className="rounded-full hover:bg-muted"><X className="w-5 h-5" /></Button>
            </div>
            <div className="overflow-y-auto p-4 space-y-6">
              {[
                { label: 'Condition 0%', photos: selectedEntryPhotos.photos0 },
                { label: 'Condition 50%', photos: selectedEntryPhotos.photos50 },
                { label: 'Finishing 100%', photos: selectedEntryPhotos.photos100 }
              ].map((stage, i) => (
                <div key={i} className="space-y-3">
                   <h4 className="font-bold text-xs uppercase tracking-widest opacity-60 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-primary" /> {stage.label}
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                     {stage.photos && stage.photos.length > 0 ? stage.photos.map((url, k) => (
                        <div key={k} className="aspect-video bg-muted rounded-2xl overflow-hidden shadow-sm border border-border relative group">
                           <FirebaseImage url={url} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                        </div>
                     )) : (
                        <div className="col-span-2 text-xs text-muted-foreground italic h-24 flex items-center justify-center bg-muted/20 border border-border border-dashed rounded-2xl">Tidak ada foto</div>
                     )}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden relative z-10 w-full bg-[#f8fafc] dark:bg-background">
      <header className="fixed top-4 left-4 right-4 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6 rounded-[2rem] shadow-md max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} className="rounded-full shadow-md bg-indigo-600 hover:bg-indigo-700 text-white border-none font-bold tracking-wider h-11 px-5 transition-all focus:ring-4 focus:ring-indigo-500/30">
            <ArrowLeft className="w-5 h-5 mr-2" strokeWidth={2.5} />
            <span className="uppercase text-xs hidden sm:inline">Back</span>
          </Button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight uppercase leading-none drop-shadow-sm text-foreground">{currentProject.name}</h1>
                <Badge variant={currentProject.type === 'asphalt' ? 'info' : 'success'} className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">{currentProject.type || 'Legacy'}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <Circle className={cn("w-2 h-2 fill-current drop-shadow", isAdmin ? "text-amber-500" : "text-indigo-500")} />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{isAdmin ? "Admin Control" : "Field Access"}</span>
                {lastKM && (
                  <>
                    <div className="w-1.5 h-1.5 bg-border rounded-full" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Progress: {lastKM}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="icon"
              className="rounded-full w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center bg-white hover:bg-slate-50 dark:bg-slate-800 border-border shadow-md text-blue-600 transition-all ring-1 ring-black/5 dark:ring-white/10"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5 mx-0" />
            </Button>
            <Button onClick={() => exportExcel()} variant="outline" className="rounded-2xl h-10 sm:h-12 border-border shadow-sm hover:bg-secondary text-emerald-600 bg-background/50">
              <FileSpreadsheet className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">Excel</span>
            </Button>
            <Button 
              onClick={() => {
                console.log('PDF Download Clicked', { projectId: currentProject.id, entries: entries.length });
                exportToPDF(currentProject, filteredEntries, undefined, entries);
              }} 
              variant="outline" 
              className="rounded-2xl h-10 sm:h-12 border-border shadow-sm hover:bg-secondary text-rose-500 bg-background/50"
            >
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline font-bold text-xs uppercase tracking-widest">PDF</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Viewport Content */}
      <main {...swipeHandlers} className="flex-1 overflow-y-auto pt-28 pb-8 px-4 sm:px-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card className="lg:col-span-2 p-6 rounded-[2rem] bg-card border border-border/50 shadow-sm relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 p-5 opacity-[0.03] pointer-events-none">
                 <Sparkles className="w-48 h-48 text-indigo-600 dark:text-indigo-400" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                    <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight uppercase leading-none drop-shadow-sm">CPM Smart Pulse</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">AI Generative Insights</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingAI}
                  className="rounded-xl h-10 px-4 border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm transition-all"
                >
                  {isGeneratingAI ? <RefreshCw size={14} className="animate-spin mr-2" /> : <RefreshCw size={14} className="mr-2" />}
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sync Insight</span>
                </Button>
              </div>

              <div className="relative z-10 bg-secondary/50 backdrop-blur-md p-5 rounded-2xl border border-border/50">
                {aiSummary ? (
                  <p className="text-sm font-medium leading-relaxed italic text-foreground opacity-90">
                    "{aiSummary}"
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Klik tombol untuk menganalisis data proyek menggunakan AI...
                  </p>
                )}
              </div>
            </Card>

          </div>
          
          {/* Tab Controller UI */}
              <div className="flex bg-card p-1.5 rounded-[2rem] border border-border/50 mb-8 max-w-lg mx-auto shadow-sm">
            {[
              { id: 'input', label: 'Input', icon: Calculator },
              { id: 'data', label: 'Data', icon: Database },
              { id: 'report', label: 'Daily', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].filter(t => isAudit ? t.id !== 'input' : true).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "flex-1 py-3 flex flex-col items-center justify-center gap-1 rounded-[1.5rem] transition-all duration-300",
                  activeTab === t.id ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black shadow-inner" : "text-muted-foreground hover:text-foreground font-bold hover:bg-secondary/50"
                )}
              >
                <t.icon className="w-4 h-4" strokeWidth={activeTab === t.id ? 2.5 : 2} />
                <span className="text-[9px] uppercase tracking-widest leading-none">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full">
            {activeTab === 'input' && (
              <motion.div key="input" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, ease: [0.25, 1, 0.5, 1] }} className="grid grid-cols-1 lg:grid-cols-2 gap-5 will-change-transform">
                 <Card className="p-6 md:p-12 space-y-8 rounded-[2rem] border border-border/50 bg-card relative overflow-hidden shadow-sm">
                   <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                      <Calculator className="w-48 h-48 rotate-12 text-indigo-600 dark:text-indigo-400" />
                   </div>
                   
                   <div className="space-y-3 relative z-10">
                     <h3 className="text-2xl font-black tracking-tight uppercase text-foreground">Parameter Log</h3>
                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Input detail teknis pengerjaan untuk proyek {currentProject.type}.</p>
                   </div>

                   <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Equipment / Vehicle Utama</label>
                            <select 
                              value={equipmentUsed}
                              onChange={e => setEquipmentUsed(e.target.value)}
                              className="w-full bg-background border border-border rounded-xl h-12 px-4 text-[10px] focus:ring-2 focus:ring-primary outline-none"
                            >
                              <option value="">-- Select Equipment --</option>
                              {equipmentList.map(item => (
                                <option key={item} value={item}>{item}</option>
                              ))}
                            </select>
                         </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Progress Status</label>
                            <div className="flex gap-2">
                               {['pending', 'in-progress', 'completed'].map(s => (
                                 <Button 
                                   key={s} 
                                   variant={entryStatus === s ? 'primary' : 'outline'}
                                   onClick={() => setEntryStatus(s as any)}
                                   className="flex-1 rounded-xl h-12 text-[10px]"
                                 >{s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</Button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                     {/* KM Range for Painting */}
                     {currentProject.type === 'painting' ? (
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Start KM</label>
                           <Input placeholder="KM 1+000" value={km} onChange={e => setKm(e.target.value)} className={errors.km ? "border-rose-500" : ""} />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">End KM</label>
                           <Input placeholder="KM 300+000" value={kmTo} onChange={e => setKmTo(e.target.value)} className={errors.kmTo ? "border-rose-500" : ""} />
                         </div>
                       </div>
                     ) : (
                       <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">KM / STA Location</label>
                         <Input placeholder="KM 12+345" value={km} onChange={e => setKm(e.target.value)} className={errors.km ? "border-rose-500" : ""} />
                       </div>
                     )}

                     {/* Traffic Sign & Inlet Specific */}
                     {(currentProject.type === 'traffic-sign' || currentProject.type === 'inlet') && (
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{currentProject.type === 'inlet' ? 'Inlet Size' : 'Sign Type'}</label>
                           <Input placeholder={currentProject.type === 'inlet' ? 'E.g.: 1m x 1m' : 'Warning Sign'} value={signType} onChange={e => setSignType(e.target.value)} className={errors.signType ? "border-rose-500" : ""} />
                           {currentProject.type === 'inlet' && (
                             <div className="flex gap-2 mt-2">
                               <button type="button" onClick={() => setSignType('37x24')} className={cn("text-[9px] font-bold px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors uppercase", signType === '37x24' && "bg-primary text-primary-foreground border-primary")}>37x24</button>
                               <button type="button" onClick={() => setSignType('34x22')} className={cn("text-[9px] font-bold px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors uppercase", signType === '34x22' && "bg-primary text-primary-foreground border-primary")}>34x22</button>
                             </div>
                           )}
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Quantity (Units/Pcs)</label>
                           <Input type="number" placeholder="0" value={qty} onChange={e => setQty(e.target.value)} className={errors.qty ? "border-rose-500" : ""} />
                         </div>
                       </div>
                     )}

                     {/* Planting Specific */}
                     {currentProject.type === 'planting' && (
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Plant Type</label>
                           <Input placeholder="Red Shoots / Mahogany" value={plantType} onChange={e => setPlantType(e.target.value)} className={errors.plantType ? "border-rose-500" : ""} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Quantity (Trees)</label>
                            <Input type="number" placeholder="0" value={qty} onChange={e => setQty(e.target.value)} className={errors.qty ? "border-rose-500" : ""} />
                         </div>
                       </div>
                     )}

                     {/* Painting Specific Ext. */}
                     {currentProject.type === 'painting' && (
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Objek Pengecatan</label>
                            <Input placeholder="Guardrail / MCB Barrier" value={signType} onChange={e => setSignType(e.target.value)} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Area / Length (m² / m)</label>
                            <Input type="number" placeholder="0" value={qty} onChange={e => setQty(e.target.value)} />
                         </div>
                       </div>
                     )}

                     {/* Asphalt Specific */}
                     {currentProject.type === 'asphalt' && (
                       <>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Material & Density</label>
                          <div className="grid grid-cols-4 gap-2">
                            {['AC-WC', 'AC-BC', 'HRS-WC', 'Custom'].map(m => (
                              <Button 
                                key={m} 
                                variant={materialType === m ? 'primary' : 'outline'}
                                onClick={() => {
                                  setMaterialType(m);
                                  if (m === 'AC-WC') setDensity('2.300');
                                  if (m === 'AC-BC') setDensity('2.320');
                                  if (m === 'HRS-WC') setDensity('2.300');
                                }}
                                className="rounded-xl h-12 text-[10px]"
                              >{m}</Button>
                            ))}
                          </div>
                          <div className="pt-2">
                            <Input type="number" step="0.001" placeholder="Density (t/m³)" value={density} onChange={e => { setDensity(e.target.value); setMaterialType('Custom'); }} />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest block">Lane Identification <span className="text-rose-500">*</span></label>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {['L1', 'L2', 'L3', 'Inner S.', 'Outer S.', 'Other'].map(l => (
                              <Button 
                                key={l} 
                                variant={lajurDropdown === l ? 'primary' : 'outline'}
                                onClick={() => {
                                  setLaneDropdown(l);
                                  if (l !== 'Other') setLaneManual('');
                                }}
                                className={cn("p-0 h-14 text-[10px] rounded-xl", errors.lajur ? "border-rose-500" : "")}
                              >{l}</Button>
                            ))}
                          </div>
                          {lajurDropdown === 'Other' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                               <Input placeholder="Write down the Lane (e.g., Inner Shoulder)" value={lajurManual} onChange={e => setLaneManual(e.target.value)} className={errors.lajur ? "border-rose-500" : ""} />
                            </motion.div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-2xl border border-border">
                            <div className="space-y-1 text-center">
                               <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Length (m)</span>
                               <Input type="number" value={panjang} onChange={e => setLength(e.target.value)} className={cn("bg-background border-none text-center font-bold italic py-4 h-16 text-xl", errors.panjang ? "border-rose-500 ring-2 ring-rose-500" : "")} />
                            </div>
                            <div className="space-y-1 text-center">
                               <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Width (m)</span>
                               <Input type="number" value={lebar} onChange={e => setWidth(e.target.value)} className={cn("bg-background border-none text-center font-bold italic py-4 h-16 text-xl", errors.lebar ? "border-rose-500 ring-2 ring-rose-500" : "")} />
                            </div>
                            <div className="space-y-1 text-center">
                               <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Depth (cm)</span>
                               <Input type="number" value={tebal} onChange={e => setThickness(e.target.value)} className={cn("bg-background border-none text-center font-bold italic py-4 h-16 text-xl", errors.tebal ? "border-rose-500 ring-2 ring-rose-500" : "")} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center">
                            <span className="text-[10px] font-bold uppercase text-amber-500 block mb-1">Calculated Volume</span>
                            <span className="text-2xl font-bold italic">{volumeVal.toFixed(4)} <span className="text-sm font-medium opacity-50">m³</span></span>
                          </div>
                          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-center">
                            <span className="text-[10px] font-bold uppercase text-primary block mb-1">Total Tonnage</span>
                            <span className="text-2xl font-bold italic">{tonnageVal.toFixed(4)} <span className="text-sm font-medium opacity-50">t</span></span>
                          </div>
                        </div>
                       </>
                     )}

                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Notes / Description</label>
                        <textarea
                           value={entryDesc}
                           onChange={e => setEntryDesc(e.target.value)}
                           className="w-full bg-background border border-border rounded-2xl p-4 text-xs focus:ring-2 focus:ring-primary outline-none transition-all min-h-[100px]"
                           placeholder="Add additional details..."
                        />
                        {currentProject.type === 'inlet' && (
                          <div className="flex gap-2">
                             <button type="button" onClick={() => setEntryDesc(entryDesc ? `${entryDesc} (FRAME)` : '(FRAME)')} className="text-[9px] font-bold px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors uppercase">FRAME</button>
                             <button type="button" onClick={() => setEntryDesc(entryDesc ? `${entryDesc} (NON FRAME)` : '(NON FRAME)')} className="text-[9px] font-bold px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors uppercase">NON FRAME</button>
                          </div>
                        )}
                     </div>
                   </div>
                 </Card>

                 {/* Documentation & GPS */}
                 <div className="space-y-8">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-2 block mb-2">Visual Documentation</label>
                     <div className="grid grid-cols-1 gap-4">
                       {[
                      { stage: '0', photos: photos0, label: '0% Condition' },
                      { stage: '50', photos: photos50, label: '50% Condition' },
                      { stage: '100', photos: photos100, label: '100% Finishing' },
                    ].map((s) => (
                      <div key={s.stage}>
                        <Card className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant={s.stage === '100' ? 'success' : 'danger'}>{s.label}</Badge>
                          <div className="flex gap-2">
                             <label className="w-12 h-12 flex flex-col items-center justify-center bg-muted/60 border border-border rounded-2xl hover:bg-muted cursor-pointer transition-all shadow-sm" title="Camera">
                                <Camera className="w-4 h-4 text-primary mb-0.5" />
                                <span className="text-[7px] font-bold uppercase text-primary/80">Camera</span>
                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleFileUpload(e, s.stage as any)} />
                             </label>
                             <label className="w-12 h-12 flex flex-col items-center justify-center bg-muted/60 border border-border rounded-2xl hover:bg-muted cursor-pointer transition-all shadow-sm" title="Gallery">
                                <ImageIcon className="w-4 h-4 text-emerald-500 mb-0.5" />
                                <span className="text-[7px] font-bold uppercase text-emerald-500/80">Gallery</span>
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, s.stage as any)} />
                             </label>
                          </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {s.photos.map((p, i) => (
                             <div key={i} className="relative group shrink-0">
                                <FirebaseImage url={p} className="w-24 h-24 rounded-2xl border border-border object-cover" referrerPolicy="no-referrer" />
                                <button 
                                  onClick={() => removePhoto(i, s.stage as any)} 
                                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-1 rounded-full shadow-lg hover:bg-rose-600 transition-all z-10"
                                >
                                   <X size={12} />
                                </button>
                             </div>
                          ))}
                          
                          {/* Uploading Previews */}
                          {uploadingPhotos.filter(up => up.type === s.stage).map((up) => (
                             <div key={up.id} className="relative shrink-0 overflow-hidden rounded-2xl border border-primary/30 w-24 h-24 bg-muted/50">
                                <FirebaseImage url={up.preview} className="w-full h-full object-cover opacity-50 blur-[2px]" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                                   {up.status === 'compressing' ? (
                                      <>
                                         <RefreshCw className="w-5 h-5 text-white animate-spin mb-1" />
                                         <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Processing...</span>
                                      </>
                                   ) : up.status === 'error' ? (
                                      <>
                                         <X className="w-5 h-5 text-rose-500 mb-1" />
                                         <span className="text-[8px] font-bold text-rose-500 uppercase tracking-tighter">Failed</span>
                                      </>
                                   ) : (
                                      <>
                                         <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                                         <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Ready</span>
                                      </>
                                   )}
                                </div>
                             </div>
                          ))}

                          {s.photos.length === 0 && uploadingPhotos.filter(up => up.type === s.stage).length === 0 && (
                            <div className="text-center w-full py-8 border border-dashed border-border rounded-2xl text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted/20">
                              Capture documentation
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                    ))}
                  </div>
                </div>

                  <div className="bg-muted/40 p-5 rounded-2xl border border-border flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-background border border-border", location ? "text-emerald-500" : "text-primary animate-pulse")}>
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                           <h4 className="text-[10px] font-bold uppercase tracking-widest">GPS Sat-Link</h4>
                           <p className="text-[10px] font-mono text-muted-foreground uppercase">{location ? `LAT: ${location.lat.toFixed(6)} LNG: ${location.lng.toFixed(6)}` : "Awaiting signal synchronization..."}</p>
                        </div>
                     </div>
                     <Activity className="w-5 h-5 text-muted-foreground opacity-20" />
                  </div>

                  {editingEntryId && (
                    <div className="mb-4">
                        <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-2xl border-rose-500/50 text-rose-500 hover:bg-rose-500 hover:text-white font-bold uppercase transition-all flex items-center justify-center gap-2"
                        onClick={() => {
                          if (window.confirm("Cancel data changes?")) {
                            resetEntryForm();
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                        Cancel Edit
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border mt-4 mb-4">
                     <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isEntryArchived ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground")}>
                           <Archive className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-tight">Archivekan Data Ini</p>
                           <p className="text-[8px] text-muted-foreground uppercase">Data will not be counted dalam progres proyek</p>
                        </div>
                     </div>
                     <button 
                       type="button"
                       onClick={() => setIsEntryArchived(!isEntryArchived)}
                       className={cn(
                         "w-12 h-6 rounded-full transition-all relative",
                         isEntryArchived ? "bg-amber-500" : "bg-muted border border-border"
                       )}
                     >
                        <motion.div 
                          animate={{ x: isEntryArchived ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                     </button>
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-4">
                      <p className="text-rose-500 text-xs font-bold uppercase mb-2">Validation Errors Occurred:</p>
                      <ul className="list-disc pl-5 text-[10px] text-rose-500 font-medium">
                        {Object.values(errors).map((msg, i) => <li key={i}>{msg}</li>)}
                      </ul>
                    </div>
                  )}

                  <Button 
                    variant="primary" 
                    className={cn(
                      "w-full h-24 rounded-2xl shadow-md flex flex-col gap-1 italic group transition-all duration-500",
                      editingEntryId ? "bg-amber-500 hover:bg-amber-600 border-amber-400" : ""
                    )}
                    onClick={handleAddEntry}
                    disabled={isAddingEntry || isUploading}
                  >
                    <div className="flex items-center gap-4">
                      {(isAddingEntry || isUploading) ? <Activity className="w-8 h-8 animate-spin" /> : <Save className="w-8 h-8 group-hover:scale-110 transition-transform" />}
                      <div className="text-left">
                        <span className="text-2xl font-bold uppercase tracking-tight block">
                          {(isAddingEntry || isUploading) ? 'Processing...' : (editingEntryId ? 'Update Data' : 'Save New Data')}
                        </span>
                        {realizationStats.percentage >= 100 && !editingEntryId && (
                          <span className="text-[8px] font-bold text-white/60 uppercase italic">Input still permitted although target reached</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[8px] font-bold tracking-[0.4em] uppercase opacity-70">
                      {editingEntryId ? 'Updating worksheet point to cloud system' : 'Logging worksheet point to cloud system'}
                    </span>
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div key="data" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, ease: [0.25, 1, 0.5, 1] }} className="space-y-6 pb-20 will-change-transform">
                
                {currentProject.targetQty && (
                  <Card className="p-5 bg-primary/5 border-primary/20 backdrop-blur-sm rounded-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
                      <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase italic tracking-tighter flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Target Realization Monitoring
                          </h3>
                          <div className="flex gap-2">
                            {realizationStats.percentage >= 100 && (
                              <span className="text-[10px] font-bold bg-emerald-500 text-white px-3 py-1 rounded-full uppercase italic animate-pulse shadow-lg shadow-emerald-500/20">
                                Target Reached
                              </span>
                            )}
                            <span className="text-[10px] font-bold bg-primary/20 text-primary px-3 py-1 rounded-full uppercase italic">
                              {realizationStats.percentage.toFixed(1)}% {realizationStats.percentage >= 100 ? 'Over' : 'Reached'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, realizationStats.percentage)}%` }}
                            className={cn(
                              "h-full transition-all duration-700",
                              realizationStats.percentage >= 100 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-primary"
                            )}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <span>Field Progress</span>
                          <span>Target: {realizationStats.target.toLocaleString('id-ID')} {currentProject.type === 'asphalt' ? 't' : currentProject.type === 'painting' ? 'm²' : 'Pcs'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-0 divide-x divide-border w-full md:w-auto mt-4 md:mt-0">
                        <div className="text-center px-4">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">Target</span>
                          <span className="text-lg font-bold italic">{realizationStats.target.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-center px-4 relative group">
                          <span className="text-[8px] font-bold text-primary uppercase inline-block mb-1">Realization</span>
                          <span className="text-lg font-bold italic text-primary block">{realizationStats.realized.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="text-center px-4">
                          <span className="text-[8px] font-bold text-rose-500 uppercase block mb-1">Remaining</span>
                          <span className="text-lg font-bold italic text-rose-500">{realizationStats.remaining.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                <div className="flex flex-col gap-4 bg-muted/20 p-4 rounded-2xl border border-border">
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between w-full">
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-center">
                      <div className="relative w-full sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Filter Data (KM, Lane)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-12 bg-background flex-1" />
                      </div>
                      <select 
                        value={filterRanting} 
                        onChange={(e) => setFilterRanting(e.target.value)}
                        className="w-full sm:w-32 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent outline-none h-10 ring-offset-background"
                      >
                        <option value="">Semua Ranting</option>
                        <option value="Ranting 1">Ranting 1</option>
                        <option value="Ranting 2">Ranting 2</option>
                        <option value="Ranting 3">Ranting 3 (Dumai)</option>
                      </select>
                      <select 
                        value={filterArah} 
                        onChange={(e) => setFilterArah(e.target.value)}
                        className="w-full sm:w-32 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent outline-none h-10 ring-offset-background"
                      >
                        <option value="">All Directons</option>
                        <option value="A/OS">A/OS</option>
                        <option value="B/OS">B/OS</option>
                      </select>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-36 bg-background text-xs" title="Start Date" />
                        <span className="text-muted-foreground font-bold">-</span>
                        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-36 bg-background text-xs" title="End Date" />
                      </div>
                    </div>
                  
                    <div className="flex items-center justify-end gap-2 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0">
                      <Button 
                        variant={showArchived ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setShowArchived(!showArchived)}
                        className="rounded-xl h-12 text-[10px] font-bold uppercase flex gap-2 shrink-0"
                      >
                        {showArchived ? <ArchiveX size={14} /> : <Archive size={14} />}
                        {showArchived ? 'View Active' : 'View Archive'}
                      </Button>
                      <div className="flex divide-x divide-border shrink-0">
                      {currentProject.type === 'asphalt' ? (
                        <>
                          <div className="px-6 text-right">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Total Tonnage</span>
                            <span className="text-xl font-bold italic">{totalTonase.toFixed(2)}t</span>
                          </div>
                          <div className="px-6 text-right">
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Accumulated Volume</span>
                            <span className="text-xl font-bold italic text-primary">{totalVolume.toFixed(2)}m³</span>
                          </div>
                        </>
                      ) : (
                        <div className="px-6 text-right">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest block">Total Realization</span>
                          <span className="text-xl font-bold italic text-primary">
                            {finalRealizationStr}
                            {currentProject.type === 'painting' ? ' Unit/m²' : ' Pcs'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredEntries.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-card/20 rounded-2xl border border-dashed border-border border-2">
                       <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-4">
                          <Database className="w-8 h-8 opacity-20" />
                       </div>
                       <h3 className="text-sm font-bold uppercase italic tracking-widest text-muted-foreground">No Data Available</h3>
                       <p className="text-[10px] text-muted-foreground/60 uppercase mt-1">
                         {showArchived ? "No archived data" : "No workload data inputted yet"}
                       </p>
                    </div>
                  ) : (
                    <>
                      {filteredEntries.slice(0, visibleCount).map((e, idx) => (
                        <motion.div key={e.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                         <Card className={cn("p-6 flex flex-col md:flex-row gap-5 relative group rounded-[1.5rem] border border-border/50 bg-card hover:shadow-md transition-shadow", e.isArchived ? "pb-24 sm:pb-20" : "")}>
                            <div className="absolute top-4 right-4 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-md p-1.5 rounded-[1.5rem] shadow-sm border border-border/50">
                               <Button 
                                 variant="outline" 
                                 size="icon" 
                                 onClick={() => {
                                   handleEditEntry(e);
                                   setActiveTab('input');
                                   window.scrollTo({ top: 0, behavior: 'smooth' });
                                 }} 
                                 className="rounded-xl border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-white"
                                 title="Edit / Modify"
                               >
                                 <Pencil className="w-4 h-4" />
                               </Button>
                             <Button variant="outline" size="icon" onClick={() => setSelectedEntryPhotos(e)} className="rounded-xl" title="Photo Details"><Maximize2 className="w-4 h-4" /></Button>
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               onClick={() => handleArchiveEntry(e.id, !e.isArchived)} 
                               className={cn("rounded-xl", e.isArchived ? "text-emerald-500" : "text-amber-500")} 
                               title={e.isArchived ? "Pulihkan Langsung" : "Archivekan"}
                             >
                               {e.isArchived ? <ArchiveX className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                             </Button>
                             {isAdmin && <Button variant="ghost" size="icon" onClick={() => confirmDeleteEntry(e.id)} className="rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600" title="Delete"><Trash2 className="w-4 h-4" /></Button>}
                          </div>

                          <div className="flex flex-col md:flex-row gap-5 w-full relative pt-8 md:pt-0">
                           <div className="min-w-[6rem] h-auto min-h-[6rem] p-3 py-4 bg-muted/50 border border-border rounded-2xl flex flex-col items-center justify-center font-bold italic shrink-0 overflow-hidden relative">
                                {e.status === 'completed' && <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />}
                                {e.status === 'in-progress' && <div className="absolute inset-x-0 top-0 h-1 bg-amber-500" />}
                                {e.status === 'pending' && <div className="absolute inset-x-0 top-0 h-1 bg-rose-500" />}
                                <span className="text-[10px] uppercase text-primary mb-1 mt-1">KM</span>
                                <span className={cn("tracking-tighter text-center leading-[1.1]", e.km.length > 5 ? "text-lg break-words w-full" : "text-2xl")}>{e.km}</span>
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <h3 className="text-xl font-bold italic uppercase italic tracking-tighter">
                                      {currentProject.type === 'asphalt' && `Lane ${e.lajur}`}
                                      {currentProject.type === 'traffic-sign' && e.signType}
                                      {currentProject.type === 'planting' && e.plantType}
                                      {currentProject.type === 'painting' && `${e.km} - ${e.kmTo}`}
                                      {currentProject.type === 'other' && e.km}
                                   </h3>
                                   <Badge variant={e.status === 'completed' ? 'success' : (e.status === 'in-progress' ? 'info' : 'danger')}>{e.status}</Badge>
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center flex-wrap gap-2">
                                    {currentProject.type === 'asphalt' && (
                                       <>
                                         <span>{e.panjang}m × {e.lebar}m × {e.tebal}cm</span>
                                         <div className="w-1 h-1 bg-border rounded-full" />
                                         <span className="text-primary">{e.density} t/m³</span>
                                       </>
                                    )}
                                    {(currentProject.type === 'traffic-sign' || currentProject.type === 'planting' || currentProject.type === 'inlet') && (
                                       <span>Qty: {e.qty} Units</span>
                                    )}
                                    {currentProject.type === 'painting' && (
                                       <>
                                         <span>Range: {e.km} s/d {e.kmTo}</span>
                                         {e.signType && (
                                           <>
                                             <div className="w-1 h-1 bg-border rounded-full" />
                                             <span>Objek: {e.signType}</span>
                                           </>
                                         )}
                                       </>
                                    )}
                                    {e?.equipmentUsed && (
                                       <>
                                         <div className="w-1 h-1 bg-border rounded-full" />
                                         <span className="text-amber-500 font-bold">Equipment: {e?.equipmentUsed}</span>
                                       </>
                                    )}
                                    {e.description && (
                                       <>
                                          <div className="w-1 h-1 bg-border rounded-full" />
                                          <span className="italic opacity-80">{e.description.substring(0, 30)}...</span>
                                       </>
                                    )}
                                </div>
                             </div>
                          </div>

                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                             {currentProject.type === 'asphalt' ? (
                               <>
                                 <div className="bg-muted/30 p-4 rounded-2xl text-center border border-border">
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1 leading-none">Net Volume</span>
                                    <span className="text-sm font-bold italic tracking-tighter">{(e.volume || 0).toFixed(4)} m³</span>
                                 </div>
                                 <div className="bg-muted/30 p-4 rounded-2xl text-center border border-border">
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1 leading-none">Net Tonnage</span>
                                    <span className="text-sm font-bold italic tracking-tighter text-amber-500">{(e.tonase || 0).toFixed(4)} t</span>
                                 </div>
                               </>
                             ) : (
                               <>
                                 <div className="bg-muted/30 p-4 rounded-2xl text-center border border-border">
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1 leading-none">Recorded Qty</span>
                                    <span className="text-sm font-bold italic tracking-tighter text-emerald-500">
                                       {e.qty || 0} {currentProject.type === 'painting' ? 'm² / Unit' : 'Pcs'}
                                    </span>
                                 </div>
                                 <div className="bg-muted/30 p-4 rounded-2xl text-center border border-border flex items-center justify-center flex-col">
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1 leading-none">Timestamp</span>
                                    <span className="text-[10px] font-bold italic opacity-60 tracking-tighter">{new Date(e.timestamp).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'})} • {new Date(e.timestamp).toLocaleTimeString()}</span>
                                 </div>
                               </>
                             )}
                             <div className="col-span-2 flex items-center gap-2 px-2 overflow-x-auto scrollbar-hide">
                                {e && [e.photos0, e.photos50, e.photos100].map((ph, i) => (
                                   <div key={i} className="w-12 h-12 rounded-xl border border-border bg-background overflow-hidden relative">
                                      {ph && ph[0] ? <FirebaseImage url={ph[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-full h-full bg-muted/40" />}
                                      <div className="absolute inset-x-0 bottom-0 bg-primary/80 text-[6px] font-bold text-white text-center uppercase py-0.5">{['0', '50', '100'][i]}%</div>
                                   </div>
                                ))}
                             </div>
                          </div>
                          
                          {e.isArchived && (
                            <div className="absolute inset-x-0 bottom-0 bg-amber-500/90 backdrop-blur-md text-black p-3 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-3xl z-20">
                              <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                <ArchiveX className="w-5 h-5 bg-black text-amber-500 rounded-full p-1 border border-amber-400" />
                                <span>Data ini diarsipkan & tidak dikirim ke Data Pusat</span>
                              </div>
                              <Button 
                                onClick={() => {
                                  handleEditEntry(e);
                                  setActiveTab('input');
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto bg-black hover:bg-black/80 text-amber-500 font-bold uppercase rounded-xl h-10 shadow-xl border border-amber-600/50"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit & Kirim Ulang
                              </Button>
                            </div>
                          )}
                       </Card>
                    </motion.div>
                  ))}
                  {visibleCount < filteredEntries.length && (
                    <div className="flex justify-center mt-8 pb-8">
                      <Button 
                        variant="secondary"
                        onClick={() => setVisibleCount(v => v + 50)}
                        className="rounded-2xl h-12 px-8 font-bold uppercase text-xs tracking-widest bg-muted/50 hover:bg-muted"
                      >
                        Muat Lebih Banyak
                      </Button>
                    </div>
                  )}
                </>
              )}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div key="audit" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, ease: [0.25, 1, 0.5, 1] }} className="space-y-8 pb-20 will-change-transform">
                <Card className="p-5 md:p-14 border-l-[6px] border-l-emerald-500 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
                   <div className="flex items-center justify-between mb-16 relative z-10">
                      <div>
                        {currentProject.type === 'asphalt' ? (
                          <>
                            <h2 className="text-4xl font-bold italic uppercase tracking-tighter mb-2">Tonnage Audit</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Material flow distribution & analytics</p>
                          </>
                        ) : (
                          <>
                            <h2 className="text-4xl font-bold italic uppercase tracking-tighter mb-2">Progress Audit</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Kuantitas pekerjaan & pencapaian</p>
                          </>
                        )}
                      </div>
                      <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-xl shadow-emerald-900/20">
                         <TrendingUp className="w-8 h-8" />
                      </div>
                   </div>

                   <div className="h-[450px] w-full -ml-8 mb-12">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={timeSeriesData}>
                           <defs>
                              <linearGradient id="primaryArea" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                 <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} opacity={0.1} />
                           <XAxis 
                             dataKey="date" 
                             axisLine={false}
                             tickLine={false}
                             tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}
                             dy={10}
                           />
                           <YAxis 
                             axisLine={false}
                             tickLine={false}
                             tick={{ fontSize: 10, fontWeight: 700, opacity: 0.5 }}
                             dx={-10}
                           />
                           <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))', 
                                borderRadius: '1.5rem',
                                color: 'hsl(var(--foreground))',
                                padding: '1.25rem',
                                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                              }}
                              itemStyle={{ color: 'hsl(var(--primary))', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                              labelStyle={{ fontWeight: 900, marginBottom: '0.5rem', opacity: 0.5 }}
                           />
                           <Area 
                             type="monotone" 
                             dataKey={currentProject.type === 'asphalt' ? 'tonase' : 'qty'} 
                             name={currentProject.type === 'asphalt' ? 'Tonase (t)' : 'Quantity'}
                             stroke="hsl(var(--primary))" 
                             strokeWidth={5} 
                             fill="url(#primaryArea)" 
                             animationDuration={1500} 
                           />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>

                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 pt-10 border-t border-border relative z-10">
                      <div>
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Average Payload</span>
                         <span className="text-2xl font-bold italic">
                            {currentProject.type === 'asphalt' 
                              ? `${(totalTonase / (entries.length || 1)).toFixed(4)}t` 
                              : `${(filteredEntries.reduce((sum, e) => sum + (Number(e.qty) || 0), 0) / (entries.length || 1)).toFixed(2)}`}
                         </span>
                      </div>
                      <div>
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Peak Intensity</span>
                         <span className="text-2xl font-bold italic text-primary">
                            {entries.length 
                              ? (currentProject.type === 'asphalt' 
                                  ? `${Math.max(...entries.map(e => e.tonase || 0)).toFixed(4)}t` 
                                  : `${Math.max(...entries.map(e => e.qty || 0)).toFixed(2)}`)
                              : "0"}
                         </span>
                      </div>
                      <div>
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Dataset Status</span>
                         <span className="text-2xl font-bold italic text-emerald-500 uppercase">Synchronized</span>
                      </div>
                      <div>
                         <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">System Health</span>
                         <span className="text-2xl font-bold italic uppercase">Nominal</span>
                      </div>
                   </div>
                </Card>
 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                   <Card className="p-5 md:p-12">
                     <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-12 text-center uppercase tracking-widest">
                       {currentProject.type === 'asphalt' ? 'Tonnage Accumulation Dynamics' : 'Realization Growth Curve'}
                     </h4>
                     <div className="h-80 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={timeSeriesData}>
                           <defs>
                             <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                           <XAxis 
                             dataKey="date" 
                             axisLine={false} 
                             tickLine={false}
                             tick={{ fontSize: 10, fontWeight: 700 }}
                           />
                           <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                           <Tooltip 
                             contentStyle={{ 
                               backgroundColor: 'hsl(var(--card))', 
                               border: '1px solid hsl(var(--border))', 
                               borderRadius: '1rem',
                               fontSize: '10px',
                               fontWeight: '900'
                             }} 
                           />
                           <Area 
                             type="monotone" 
                             dataKey={currentProject.type === 'asphalt' ? 'tonase' : 'qty'} 
                             stroke="hsl(var(--primary))" 
                             fillOpacity={1} 
                             fill="url(#colorValue)" 
                             strokeWidth={4}
                           />
                         </AreaChart>
                       </ResponsiveContainer>
                     </div>
                   </Card>

                   {currentProject.type === 'asphalt' ? (
                     <Card className="p-5 md:p-12">
                       <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-12 text-center">Tonnage Distribution by Lane</h4>
                       <div className="h-80 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={lajurTonnageData}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                             <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false}
                              tick={{ fontSize: 10, fontWeight: 700 }}
                             />
                             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                             <Tooltip 
                               cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
                               contentStyle={{ 
                                 backgroundColor: 'hsl(var(--card))', 
                                 border: '1px solid hsl(var(--border))', 
                                 borderRadius: '1rem',
                                 fontSize: '10px',
                                 fontWeight: '900'
                               }} 
                             />
                             <Bar 
                               dataKey="value" 
                               name="Total Tonnage (t)"
                               fill="hsl(var(--primary))" 
                               radius={[8, 8, 0, 0]}
                               animationDuration={2000}
                             >
                               {lajurTonnageData.map((_, i) => (
                                 <Cell key={i} fill={COLORS[i % COLORS.length]} />
                               ))}
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       </div>
                       <div className="flex flex-wrap gap-4 justify-center mt-8 bg-muted/20 p-4 rounded-2xl">
                          {lajurTonnageData.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 group">
                               <div className="flex items-center gap-2 text-[9px] font-bold uppercase italic">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                  {s.name}
                               </div>
                               <span className="text-[10px] font-bold">{s.value}t</span>
                            </div>
                          ))}
                       </div>
                     </Card>
                   ) : (
                    <Card className="p-12 flex flex-col items-center">
                       <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mb-12">Lane Frequency Distribution</h4>
                       <div className="h-72 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={lajurStats} innerRadius={85} outerRadius={115} paddingAngle={10} dataKey="value" stroke="none">
                                   {lajurStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip 
                                   contentStyle={{ 
                                     backgroundColor: 'hsl(var(--card))', 
                                     border: '1px solid hsl(var(--border))', 
                                     borderRadius: '1rem',
                                     fontSize: '10px',
                                     fontWeight: '900'
                                   }} 
                                />
                             </PieChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="flex flex-wrap gap-4 justify-center mt-12 bg-muted/30 p-4 rounded-2xl">
                          {lajurStats.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-[9px] font-bold uppercase italic">
                               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                               {s.name}
                            </div>
                          ))}
                       </div>
                    </Card>
                   )}

                   <Card className="p-12 space-y-12 bg-muted/10 border-dashed border-2 flex flex-col justify-center text-center">
                      <div className="space-y-4">
                         <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
                            <Info className="w-10 h-10 text-primary" />
                         </div>
                         <h3 className="text-3xl font-bold italic uppercase tracking-tighter">Verified Audit File</h3>
                         <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-sm mx-auto">
                            Report resmi proyek {currentProject.name} telah dienkripsi dan siap untuk diverifikasi oleh otoritas terkait. Gunakan tombol ekspor untuk salinan fisik.
                         </p>
                      </div>

                      <div className="max-w-md mx-auto w-full space-y-4 bg-muted/30 p-5 rounded-2xl border border-border/50 text-left">
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Otorisasi Report (Signature)</h4>
                         <div className="space-y-3">
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Nama Pemeriksa</label>
                               <Input 
                                 placeholder="Budi Santoso, S.T." 
                                 className="h-12 bg-background border-border/50 rounded-xl"
                                 value={signatureName}
                                 onChange={e => setSignatureName(e.target.value)}
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Jabatan / Role</label>
                               <Input 
                                 placeholder="Project Manager" 
                                 className="h-12 bg-background border-border/50 rounded-xl"
                                 value={signatureRole}
                                 onChange={e => setSignatureRole(e.target.value)}
                               />
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 justify-center">
                        {isAdmin && (
                          <Button 
                            onClick={() => handleRemoveDuplicateEntries(currentProject.id)}
                            className="h-16 rounded-2xl w-full max-w-[200px] text-[8px] sm:text-[10px] shadow-xl italic tracking-widest font-bold uppercase bg-primary/10 border border-primary border-dashed text-primary hover:bg-primary/20"
                          >
                            Audit Integrity
                          </Button>
                        )}
                        <Button 
                          onClick={() => exportExcel(signatureName ? { name: signatureName, role: signatureRole } : undefined)} 
                          variant="primary" 
                          className="h-16 rounded-2xl w-full max-w-[200px] text-xs shadow-xl italic tracking-widest font-bold uppercase"
                        >
                          Master Excel
                        </Button>
                        <Button 
                          onClick={() => {
                            const sign = signatureName ? { name: signatureName, role: signatureRole } : undefined;
                            exportToPDF(currentProject, filteredEntries, sign, entries);
                          }} 
                          variant="primary" 
                          className="h-16 rounded-2xl w-full max-w-[200px] text-xs shadow-xl italic tracking-widest font-bold uppercase bg-rose-600 hover:bg-rose-700"
                        >
                          Master PDF
                        </Button>
                      </div>
                   </Card>
                </div>
              </motion.div>
            )}
             {activeTab === 'report' && (
              <motion.div key="report" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 800, damping: 40, ease: [0.25, 1, 0.5, 1] }} className="space-y-6 pb-20 will-change-transform">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold italic uppercase tracking-tighter">Daily Report</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Rekapitulasi data pengerjaan per tanggal</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => {
                          const groupsForExport = entriesByDate.map(g => ({ date: g.dateDisplay, entries: g.entries }));
                          const sign = signatureName ? { name: signatureName, role: signatureRole } : undefined;
                          exportCombinedPDF(currentProject, groupsForExport, sign);
                      }}
                      variant="primary" 
                      className="rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 flex items-center gap-3 italic bg-rose-600 hover:bg-rose-700"
                    >
                      <Download className="w-5 h-5" />
                      <span>PDF Gabungan</span>
                    </Button>
                    <Button 
                      onClick={() => {
                          const groupsForExport = entriesByDate.map(g => ({ date: g.dateDisplay, entries: g.entries }));
                          const sign = signatureName ? { name: signatureName, role: signatureRole } : undefined;
                          exportCombinedDailyExcel(currentProject, groupsForExport, sign);
                      }}
                      variant="primary" 
                      className="rounded-2xl h-14 px-8 shadow-xl shadow-emerald-500/20 flex items-center gap-3 italic bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Database className="w-5 h-5" />
                      <span>Excel Gabungan</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {entriesByDate.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-muted/20 border border-dashed border-border rounded-2xl">
                       <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                       <p className="text-[10px] font-bold uppercase text-muted-foreground">None yet catatan harian</p>
                    </div>
                  ) : (
                    entriesByDate.map((group) => {
                      const dayRealized = group.entries.reduce((sum, e) => {
                        if (currentProject.type === 'asphalt') return sum + (Number(e.tonase) || 0);
                        return sum + (Number(e.qty) || 0);
                      }, 0);
                      const dayCompleted = group.entries.filter(e => e.status === 'completed').length;
                      
                      return (
                        <Card key={group.dateKey} className="p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 border-t-4 border-t-primary">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-bold uppercase italic tracking-tighter">{group.dateDisplay}</h3>
                              </div>
                              <Badge variant="outline" className="rounded-lg">{group.entries.length} Titik</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                               <div className="bg-muted/40 p-3 rounded-2xl">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">Realization</span>
                                  <span className="text-sm font-bold italic">{dayRealized.toLocaleString('id-ID')} {currentProject.type === 'asphalt' ? 't' : (currentProject.type === 'painting' ? 'm²' : 'Pcs')}</span>
                               </div>
                               <div className="bg-muted/40 p-3 rounded-2xl">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase block mb-1">Status</span>
                                  <span className="text-sm font-bold italic text-emerald-500">{dayCompleted}/{group.entries.length} OK</span>
                               </div>
                            </div>
                          </div>

                          <div className="mt-8 flex flex-col gap-2">

                             <Button 
                               onClick={() => {
                                 setStartDate(group.dateKey);
                                 setEndDate(group.dateKey);
                                 setFilterLane('');
                                 setSearchQuery('');
                                 setActiveTab('data');
                                 window.scrollTo({ top: 0, behavior: 'smooth' });
                               }}
                               variant="outline" 
                               className="w-full rounded-2xl h-12 shadow-sm border-primary/20 flex items-center justify-center gap-2 group overflow-hidden bg-primary/5 hover:bg-primary/10"
                             >
                               <Eye className="w-4 h-4 text-primary relative z-10" />
                               <span className="text-[10px] font-bold uppercase tracking-widest relative z-10 text-primary">Lihat Data</span>
                             </Button>

                             <Button 
                               onClick={() => {
                                 const sign = signatureName ? { name: signatureName, role: signatureRole } : undefined;
                                 exportToPDF(currentProject, group.entries, sign, entries);
                               }}
                               variant="outline" 
                               className="w-full rounded-2xl h-12 shadow-sm border-white/10 dark:border-white/5 flex items-center justify-center gap-2 group overflow-hidden"
                             >
                               <div className="absolute inset-0 bg-rose-500/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                               <FileText className="w-4 h-4 text-rose-500 relative z-10" />
                               <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">Export PDF</span>
                             </Button>
                             <Button 
                               onClick={() => {
                                 const sign = signatureName ? { name: signatureName, role: signatureRole } : undefined;
                                 exportDailyExcel(currentProject, group.dateDisplay, group.entries, sign, entries);
                               }}
                               variant="outline" 
                               className="w-full rounded-2xl h-12 shadow-sm border-white/10 dark:border-white/5 flex items-center justify-center gap-2 group overflow-hidden"
                             >
                               <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform" />
                               <Database className="w-4 h-4 text-emerald-500 relative z-10" />
                               <span className="text-[10px] font-bold uppercase tracking-widest relative z-10">Export Excel</span>
                             </Button>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <div className="p-5 space-y-6 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <Trash2 className="w-10 h-10 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Delete Data</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Apakah Anda yakin ingin menghapus laporan ini? Data akan dihapus secara permanen.
          </p>
          <div className="flex gap-3">
             <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="flex-1 h-14 rounded-2xl">Cancel</Button>
             <Button variant="primary" onClick={executeDeleteEntry} className="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white border-none shadow-md">Ya, Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
};

/* --- Helpers --- */
const Badge = ({ children, variant = 'info', className }: any) => {
  const styles: Record<string, string> = {
    info: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    outline: 'bg-transparent text-muted-foreground border border-border',
  };
  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.2em] shadow-sm", styles[variant], className)}>
      {children}
    </span>
  );
};

export default ProjectDetailPage;
