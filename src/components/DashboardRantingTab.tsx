import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getRantingClass } from '../utils/ranting';
import { exportToPDF } from '../utils/pdfExport';
import { 
  Button, 
  Card, 
  Input, 
  Badge,
  cn
} from './ui/Base';
import { 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  Search, 
  X, 
  Layers, 
  Calendar, 
  Activity, 
  TrendingUp, 
  HelpCircle,
  TrendingDown,
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardRantingTab: React.FC = () => {
  const { projects, exportExcel } = useApp();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return projects && projects.length > 0 ? projects[0].id : '';
  });

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Signature parameters for report downloads
  const [signatureName, setSignatureName] = useState<string>('');
  const [signatureRole, setSignatureRole] = useState<string>('');

  // Detailed inspect state
  const [viewingRantingId, setViewingRantingId] = useState<string | null>(null);
  const [viewingRantingTitle, setViewingRantingTitle] = useState<string>('');
  const [rantingSearch, setRantingSearch] = useState<string>('');
  const [rantingStatusFilter, setRantingStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  const selectedProject = useMemo(() => {
    return (projects || []).find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const activeProjectEntries = useMemo(() => {
    if (!selectedProject) return [];
    return selectedProject.entries || [];
  }, [selectedProject]);

  // Ranting configurations
  const rantingConfigs = [
    { 
      id: 'Ranting 1', 
      title: 'Ranting 1 (Pekanbaru/Kandis)', 
      desc: 'Mencakup STA KM 08+000, 08+600, 08+800 sd 09+300 AOS, KM 12+200, 08+000 BOS, dan area Kandis.' 
    },
    { 
      id: 'Ranting 2', 
      title: 'Ranting 2', 
      desc: 'Mencakup STA KM 74+800, 60+200 sd 61+420 BOS, KM 44+000 sd 55+630.' 
    },
    { 
      id: 'Ranting 3', 
      title: 'Ranting 3 (Dumai)', 
      desc: 'Mencakup area Dumai dan sekitarnya (sektor pengerjaan sisa di luar Ranting 1 & Ranting 2).' 
    }
  ];

  // Get active entries for the viewed ranting in detailed inspector
  const activeRantingEntries = useMemo(() => {
    if (!viewingRantingId || !selectedProject) return [];
    return activeProjectEntries.filter(e => {
      if (!e) return false;
      if (e.isArchived) return false;
      return getRantingClass(e.km) === viewingRantingId;
    });
  }, [activeProjectEntries, viewingRantingId, selectedProject]);

  // Search filter inside Ranting details list
  const filteredRantingEntries = useMemo(() => {
    return activeRantingEntries.filter(e => {
      const searchLower = (rantingSearch || "").toLowerCase();
      const kmMatch = 
        (e.km || "").toLowerCase().includes(searchLower) || 
        (e.lajur || "").toLowerCase().includes(searchLower) || 
        (e.description || "").toLowerCase().includes(searchLower);
      
      if (!kmMatch) return false;
      
      if (rantingStatusFilter === 'completed') {
        return e.status === 'completed';
      }
      if (rantingStatusFilter === 'in_progress') {
        return e.status !== 'completed';
      }
      return true;
    });
  }, [activeRantingEntries, rantingSearch, rantingStatusFilter]);

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-card rounded-[2rem] border border-border/50">
        <Layers className="w-16 h-16 text-muted-foreground opacity-30 mb-4 animate-pulse" />
        <h3 className="text-xl font-black uppercase italic">Tidak Ada Proyek Aktif</h3>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
          Tambahkan proyek terlebih dahulu untuk memonitor progres Ranting kerja harian.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-muted/30 p-5 rounded-2xl border border-border gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600/10 p-3 rounded-2xl">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold italic uppercase">Laporan Progres Ranting</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              Monitoring, Verifikasi, & Download Laporan Per Ranting Kerja
            </p>
          </div>
        </div>

        {/* Project Selector inside Header */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setViewingRantingId(null);
            }}
            className="bg-card border border-border/50 rounded-xl h-11 px-4 text-xs font-black uppercase text-foreground outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm transition-all whitespace-nowrap max-w-xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.toUpperCase()} ({p.type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject && (
        <>
          {/* Customizer Panel for filters & signatures */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 bg-card/60 p-6 rounded-3xl border border-border/50 shadow-sm backdrop-blur-sm">
            {/* Filter Date */}
            <div className="space-y-3.5 bd-r border-border/30 pr-0 lg:pr-5">
              <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 block uppercase">
                1. Filter Rentang Laporan
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Mulai
                  </label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="rounded-xl w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Selesai
                  </label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className="rounded-xl w-full text-xs"
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                  className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1 hover:underline pt-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filter Tanggal
                </button>
              )}
            </div>

            {/* Customizer Signatures */}
            <div className="space-y-3.5 lg:col-span-2">
              <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 block uppercase">
                2. Data Penandatangan Laporan (Opsional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Nama Penanggung Jawab
                  </label>
                  <Input 
                    placeholder="Contoh: Budi Santoso, S.T." 
                    value={signatureName} 
                    onChange={(e) => setSignatureName(e.target.value)} 
                    className="rounded-xl w-full text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block mb-1">
                    Jabatan / Role
                  </label>
                  <Input 
                    placeholder="Contoh: Site Manager / Project Manager" 
                    value={signatureRole} 
                    onChange={(e) => setSignatureRole(e.target.value)} 
                    className="rounded-xl w-full text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ranting Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rantingConfigs.map((rantingConfig) => {
              // Extract and filter matching entries
              const rantingEntries = activeProjectEntries.filter(e => {
                if (!e) return false;
                if (e.isArchived) return false;

                const entryRanting = getRantingClass(e.km);
                if (entryRanting !== rantingConfig.id) return false;

                let entryDate = '';
                try {
                  if (e.timestamp) {
                    const d = new Date(e.timestamp);
                    if (!isNaN(d.getTime())) {
                      entryDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    }
                  }
                } catch (err) {}

                const matchesStartDate = startDate === '' || entryDate >= startDate;
                const matchesEndDate = endDate === '' || entryDate <= endDate;
                return matchesStartDate && matchesEndDate;
              });

              const totalItems = rantingEntries.length;
              const completedCount = rantingEntries.filter(e => e.status === 'completed').length;
              const realizedTotal = rantingEntries.reduce((sum, e) => {
                if (selectedProject.type === 'asphalt') return sum + (Number(e.tonase) || 0);
                return sum + (Number(e.qty) || 0);
              }, 0);
              const unit = selectedProject.type === 'asphalt' ? 't' : selectedProject.type === 'painting' ? 'm²' : 'u';

              return (
                <Card 
                  key={rantingConfig.id} 
                  className="p-6 relative overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 border-t-4 border-t-indigo-600 bg-card rounded-[2rem]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black italic tracking-tight text-foreground uppercase">
                        {rantingConfig.title}
                      </h3>
                      <div className="bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-xl">
                        <span className="text-[10px] font-black italic text-indigo-600 dark:text-indigo-400">
                          {totalItems} TITIK KM
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed h-12 overflow-hidden text-ellipsis">
                      {rantingConfig.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-dashed border-border/60">
                      <div>
                        <span className="text-[9px] font-black text-muted-foreground block uppercase">REALISASI</span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {realizedTotal.toLocaleString('id-ID')} {unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-muted-foreground block uppercase">STATUS</span>
                        <span className="text-sm font-black text-emerald-600">
                          {completedCount} / {totalItems} OK
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2.5">
                    <Button
                      onClick={() => {
                        if (rantingEntries.length === 0) {
                          alert(`Tidak ada data pengerjaan untuk ${rantingConfig.title} pada rentang tanggal terpilih.`);
                          return;
                        }
                        const sign = signatureName ? { name: signatureName, role: signatureRole } : undefined;
                        exportToPDF(selectedProject, rantingEntries, sign, activeProjectEntries);
                      }}
                      variant="primary"
                      className="w-full rounded-2xl h-11 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group bg-rose-600 hover:bg-rose-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <FileText className="w-4 h-4 text-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Unduh PDF Ranting</span>
                    </Button>

                    <Button
                      onClick={() => {
                        if (rantingEntries.length === 0) {
                          alert(`Tidak ada data pengerjaan untuk ${rantingConfig.title} pada rentang tanggal terpilih.`);
                          return;
                        }
                        const sign = signatureName ? { name: signatureName, role: signatureRole } : undefined;
                        exportExcel(sign, rantingEntries);
                      }}
                      variant="outline"
                      className="w-full rounded-2xl h-11 shadow-sm border-border flex items-center justify-center gap-2 group hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Unduh Excel Ranting</span>
                    </Button>

                    <Button
                      onClick={() => {
                        setViewingRantingId(rantingConfig.id);
                        setViewingRantingTitle(rantingConfig.title);
                        setRantingSearch("");
                        setRantingStatusFilter("all");
                      }}
                      variant="outline"
                      className="w-full rounded-2xl h-11 shadow-sm border-border flex items-center justify-center gap-2 group hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Eye className="w-4 h-4 text-indigo-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Lihat Daftar KM</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Ranting KM Inspector Widescreen Drawer Overlay */}
      <AnimatePresence>
        {viewingRantingId !== null && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setViewingRantingId(null)} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm shadow-inner" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-card w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-border/50 flex flex-col max-h-[85vh] z-50 bg-background/95 backdrop-blur-md"
            >
              <button 
                onClick={() => setViewingRantingId(null)} 
                className="absolute top-6 right-6 text-foreground/50 hover:text-foreground hover:bg-muted p-2 rounded-full transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 space-y-6 flex flex-col h-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 border-border/40">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-indigo-600 dark:text-indigo-400 block uppercase">
                      Informasi Penataan Wilayah Terfokus
                    </span>
                    <h3 className="text-2xl font-black text-foreground italic uppercase flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-indigo-500" />
                      {viewingRantingTitle}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold px-3.5 py-1.5 rounded-xl border border-indigo-500/10">
                      {filteredRantingEntries.length} TITIK COCOK
                    </span>
                  </div>
                </div>

                {/* Grid Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-indigo-50/20 dark:bg-indigo-950/10 p-4 rounded-3xl border border-indigo-500/5">
                  <div className="bg-card/50 p-3 rounded-2xl border border-border/40 text-center">
                    <span className="text-[9px] font-black text-muted-foreground block uppercase">TOTAL TITIK</span>
                    <span className="text-xl font-black text-foreground font-mono">
                      {activeRantingEntries.length}
                    </span>
                  </div>
                  <div className="bg-card/50 p-3 rounded-2xl border border-border/40 text-center">
                    <span className="text-[9px] font-black text-muted-foreground block uppercase">REALISASI</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                      {activeRantingEntries.reduce((sum, e) => {
                        if (selectedProject?.type === 'asphalt') return sum + (Number(e.tonase) || 0);
                        return sum + (Number(e.qty) || 0);
                      }, 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="bg-card/50 p-3 rounded-2xl border border-border/40 text-center">
                    <span className="text-[9px] font-black text-muted-foreground block uppercase">SELESAI (OK)</span>
                    <span className="text-xl font-black text-emerald-600 font-mono">
                      {activeRantingEntries.filter(e => e.status === 'completed').length}
                    </span>
                  </div>
                  <div className="bg-card/50 p-3 rounded-2xl border border-border/40 text-center">
                    <span className="text-[9px] font-black text-muted-foreground block uppercase">PROGRES (WIP)</span>
                    <span className="text-xl font-black text-amber-500 font-mono">
                      {activeRantingEntries.filter(e => e.status !== 'completed').length}
                    </span>
                  </div>
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari KM, lajur, atau catatan..."
                      value={rantingSearch}
                      onChange={(e) => setRantingSearch(e.target.value)}
                      className="pl-10 rounded-2xl w-full"
                    />
                  </div>
                  <div className="flex bg-muted/30 p-1.5 rounded-2xl self-stretch border border-border/40">
                    {(['all', 'completed', 'in_progress'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setRantingStatusFilter(opt)}
                        className={cn(
                          "px-4 py-1.5 text-[10px] font-black uppercase rounded-xl transition-all whitespace-nowrap",
                          rantingStatusFilter === opt
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {opt === 'all' ? 'Semua' : opt === 'completed' ? 'Selesai (OK)' : 'Belum Selesai'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-y-auto border border-border/40 rounded-3xl min-h-[250px] bg-muted/5">
                  {filteredRantingEntries.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-xs italic">
                      Tidak ada titik KM yang cocok dengan kriteria pencarian Anda.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/40 bg-muted/45 text-[10px] font-black text-muted-foreground uppercase tracking-wider sticky top-0 bg-card z-10">
                          <th className="py-4 px-4 text-center w-16">No</th>
                          <th className="py-4 px-4">KM / STA</th>
                          <th className="py-4 px-4">Lajur / Arah</th>
                          <th className="py-4 px-4 text-right">Volume</th>
                          <th className="py-4 px-4">Status</th>
                          <th className="py-4 px-4">Catatan / Detail</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 text-xs">
                        {filteredRantingEntries.map((e, idx) => {
                          const isComp = e.status === 'completed';
                          const q = selectedProject?.type === 'asphalt' ? (Number(e.tonase) || Number(e.qty) || 0) : (Number(e.qty) || 0);
                          const unit = selectedProject?.type === 'asphalt' ? 't' : selectedProject?.type === 'painting' ? 'm²' : 'u';
                          return (
                            <tr key={e.id || idx} className="hover:bg-muted/15 transition-all font-medium">
                              <td className="py-3.5 px-4 text-center text-muted-foreground font-mono">{idx + 1}</td>
                              <td className="py-3.5 px-4 font-black text-foreground">{e.km}</td>
                              <td className="py-3.5 px-4">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider",
                                  (e.lajur || "").toUpperCase().includes("B/OS") || (e.lajur || "").toUpperCase().includes("BOS")
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                    : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                                )}>
                                  {e.lajur || 'A/OS'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-foreground font-black">
                                {q.toLocaleString('id-ID')} <span className="text-[10px] text-muted-foreground font-normal">{unit}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white",
                                  isComp ? "bg-emerald-500" : "bg-amber-500"
                                )}>
                                  {isComp ? 'Selesai' : 'WIP'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-muted-foreground text-[11px] max-w-[200px] truncate" title={e.description || ''}>
                                {e.description || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/40">
                  <Button
                    variant="outline"
                    onClick={() => setViewingRantingId(null)}
                    className="w-full h-12 rounded-2xl font-black text-[10px] uppercase tracking-wider"
                  >
                    Kembali Ke Daftar Ranting
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
