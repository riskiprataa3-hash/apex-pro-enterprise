import React, { useState } from 'react';
import { 
  Camera, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Trash2, 
  Calendar, 
  LayoutDashboard, 
  History, 
  Send, 
  ChevronRight, 
  FileSpreadsheet, 
  ShieldCheck, 
  Check,
  Search,
  Filter,
  FileText,
  Download,
  Eye,
  X,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { useApp, Attendance } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Input, cn, Badge } from './ui/Base';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AttendanceTab = () => {
  const { 
    user, 
    projects, 
    attendanceLogs, 
    handleCreateAttendance, 
    compressImageToFile,
    uploadFileToStorage,
    isAdmin,
    workers,
    cashAdvances,
    addNotification,
    needsInduction,
    handleCreateHseLog
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'record' | 'history'>(isAdmin ? 'history' : 'record');
  const [projectId, setProjectId] = useState('');
  const [attendanceType, setAttendanceType] = useState<'tbm' | 'checkout'>('tbm');
  const [photo, setPhoto] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // HSE / APD Check States
  const [hsePPE, setHsePPE] = useState(false);
  const [hseTools, setHseTools] = useState(false);
  const [hseEnv, setHseEnv] = useState(false);
  const [hseInduction, setHseInduction] = useState(false);
  const [showHseCheck, setShowHseCheck] = useState(false);

  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const selectedProject = projects.find(p => p.id === projectId);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCapturing(true);
    try {
      const compressed = await compressImageToFile(file, 800, 800, 0.7);
      const url = await uploadFileToStorage(compressed, `attendance/${user?.uid || 'unknown'}`);
      setPhoto(url);
    } catch (err: any) {
      addNotification("Gagal", "Gagal mengunggah foto: " + err.message, "error");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    if (!photo) {
      addNotification("Gagal", "Foto wajib dilampirkan.", "warning");
      return;
    }
    if (!projectId) {
      addNotification("Gagal", "Pilih proyek terlebih dahulu.", "warning");
      return;
    }

    // Trigger HSE Checklist if needed for TBM
    if (attendanceType === 'tbm' && needsInduction && !showHseCheck) {
      setShowHseCheck(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // If we were showing HSE check, first submit the HSE log
      if (showHseCheck) {
        if (!hsePPE || !hseTools || !hseEnv || !hseInduction) {
          addNotification("Peringatan", "Semua poin K3/APD wajib disetujui.", "warning");
          setIsSubmitting(false);
          return;
        }
        await handleCreateHseLog({
          ppeCheck: hsePPE,
          toolCheck: hseTools,
          environmentCheck: hseEnv,
          inductionConfirmed: hseInduction
        });
      }

      await handleCreateAttendance(
        attendanceType,
        photo,
        projectId,
        selectedProject?.name,
        note
      );
      // Reset form
      setPhoto('');
      setNote('');
      setShowHseCheck(false);
      setActiveSubTab('history');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const preloadImageAsBase64 = async (url: string, retries = 2): Promise<string | null> => {
    if (!url) return null;
    if (url.startsWith('data:')) {
      if (url.startsWith('data:image/')) return url;
      return null;
    }
    
    const proxyUrl = "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&w=400&output=jpg&q=80";
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) throw new Error("Not an image");
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (result && result.startsWith('data:image/')) {
            resolve(result);
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 1000));
        return preloadImageAsBase64(url, retries - 1);
      }
      return null;
    }
  };

  const exportAttendancePDF = async () => {
    try {
      const doc = new jsPDF();

      // Preload images
      const loadedImages: Record<string, string> = {};
      for (const log of filteredLogs) {
        if (log.photo && !loadedImages[log.photo]) {
          const b64 = await preloadImageAsBase64(log.photo);
          if (b64) loadedImages[log.photo] = b64;
        }
      }
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text('LAPORAN ABSENSI & GAJI OPERASIONAL', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text('PT. SHAKA ANUGERAH KARYA - DIGITAL MONITORING SYSTEM', pageWidth / 2, 28, { align: 'center' });
      
      if (startDate || endDate) {
        doc.setFontSize(9);
        const range = `Periode: ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Awal'} s/d ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Sekarang'}`;
        doc.text(range, pageWidth / 2, 35, { align: 'center' });
      }

      // --- LOGS TABLE ---
      const tableRows = filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleDateString('id-ID'),
        new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        log.type === 'tbm' ? 'TBM' : 'CHECKOUT',
        log.userName.toUpperCase(),
        (log.projectName || 'INTERNAL').toUpperCase(),
        (log.teamNote || '-').toUpperCase()
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['TANGGAL', 'WAKTU', 'TIPE', 'NAMA', 'PROYEK', 'CATATAN']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8 },
        bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
        styles: { cellPadding: 3, valign: 'middle' },
      });

      // --- SALARY SUMMARY ---
      if (isAdmin) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text('RINGKASAN KEHADIRAN & RINCIAN GAJI', 14, 20);
        
        const workerSummary = new Map<string, {name: string, uniqueDays: Set<string>, workerObj?: any}>();
        filteredLogs.forEach(log => {
          const email = log.userEmail;
          const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
          if (!workerSummary.has(email)) {
            workerSummary.set(email, { 
              name: log.userName, 
              uniqueDays: new Set(),
              workerObj: workers.find(w => w.email?.toLowerCase() === email?.toLowerCase())
            });
          }
          workerSummary.get(email)?.uniqueDays.add(dateStr);
        });

        const relevantAdvances = cashAdvances.filter(a => {
          const aDate = new Date(a.timestamp);
          if (startDate && aDate < new Date(startDate)) return false;
          if (endDate && aDate > new Date(new Date(endDate).getTime() + 86400000)) return false;
          return true;
        });

        const summaryRows: any[] = [];
        workerSummary.forEach((data, email) => {
          const daysWorked = data.uniqueDays.size;
          const rate = data.workerObj?.dailyRate || 0;
          const grossSalary = daysWorked * rate;
          const workerAdvances = relevantAdvances.filter(a => a.workerEmail.toLowerCase() === email.toLowerCase());
          const totalAdvances = workerAdvances.reduce((sum, a) => sum + a.amount, 0);
          const netSalary = grossSalary - totalAdvances;

          summaryRows.push([
            data.name.toUpperCase(),
            data.workerObj?.employeeId || '-',
            `${daysWorked} HARI`,
            `Rp ${rate.toLocaleString('id-ID')}`,
            `Rp ${totalAdvances.toLocaleString('id-ID')}`,
            `Rp ${netSalary.toLocaleString('id-ID')}`
          ]);
        });

        autoTable(doc, {
          startY: 30,
          head: [['NAMA', 'ID', 'KEHADIRAN', 'RATE/HARI', 'KASBON', 'TOTAL GAJI']],
          body: summaryRows,
          theme: 'grid',
          headStyles: { fillColor: [15, 118, 110], fontSize: 9 }, // Teal-700
          bodyStyles: { fontSize: 8 },
        });

        // --- ATTENDANCE PHOTOS APPENDIX ---
        doc.addPage();
        doc.setFontSize(14);
        doc.text('LAMPIRAN FOTO DOKUMENTASI KEHADIRAN', 14, 20);
        
        let yPos = 30;
        let xPos = 14;
        const imgWidth = 55;
        const imgHeight = 40;
        const gap = 10;

        filteredLogs.forEach((log, index) => {
           if (yPos + imgHeight > 280) {
             doc.addPage();
             yPos = 30;
           }
           
           try {
             const actualImg = loadedImages[log.photo];
             if (!actualImg || !actualImg.startsWith('data:image/')) {
               doc.rect(xPos, yPos, imgWidth, imgHeight);
               doc.text('IMAGE ERROR', xPos + 15, yPos + 20);
             } else {
               let format = 'JPEG';
               if (actualImg.startsWith('data:image/png')) format = 'PNG';
               else if (actualImg.startsWith('data:image/webp')) format = 'WEBP';
               doc.addImage(actualImg, format, xPos, yPos, imgWidth, imgHeight);
               doc.setFontSize(6);
               doc.text(`${log.userName} - ${new Date(log.timestamp).toLocaleDateString('id-ID')}`, xPos, yPos + imgHeight + 4);
               doc.text(`${log.type.toUpperCase()} - ${log.projectName || 'N/A'}`, xPos, yPos + imgHeight + 8);
             }
           } catch (e) {
             console.error("Error adding image to PDF", e);
             doc.rect(xPos, yPos, imgWidth, imgHeight);
             doc.text('IMAGE ERROR', xPos + 15, yPos + 20);
           }

           xPos += imgWidth + gap;
           if (xPos + imgWidth > pageWidth - 14) {
             xPos = 14;
             yPos += imgHeight + 15;
           }
        });
      }

      doc.save(`Laporan_Shaka_${new Date().toISOString().split('T')[0]}.pdf`);
      addNotification("Berhasil", "Laporan PDF telah berhasil diekspor.", "success");
    } catch (err: any) {
      console.error(err);
      addNotification("Gagal", "Gagal mengekspor PDF: " + err.message, "error");
    }
  };

  const exportAttendanceExcel = async () => {
    try {
      const ExcelJS = await import('exceljs');
      const { saveAs } = await import('file-saver');
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('REKAP ABSENSI OPERASIONAL');
      
      // Professional Styling & Header
      worksheet.mergeCells('A1:G1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LAPORAN ABSENSI HARIAN TIM OPERASIONAL (TOOLBOX MEETING & SELESAI KERJA)';
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:G2');
      const companyCell = worksheet.getCell('A2');
      companyCell.value = 'PT. SHAKA ANUGERAH KARYA - SISTEM MANAJEMEN INFRASTRUKTUR';
      companyCell.font = { bold: true, size: 11 };
      companyCell.alignment = { horizontal: 'center' };
      
      worksheet.addRow([]); // Gap

      const headerRow = worksheet.addRow(['TANGGAL', 'WAKTU', 'KATEGORI', 'NAMA PERSONIL', 'PROYEK / LOKASI', 'CATATAN LAPANGAN', 'KOORDINAT GPS']);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.eachCell(cell => {
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Slate-800
         cell.alignment = { horizontal: 'center', vertical: 'middle' };
         cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
      });

      worksheet.columns = [
        { key: 'date', width: 15 },
        { key: 'time', width: 12 },
        { key: 'type', width: 20 },
        { key: 'person', width: 25 },
        { key: 'project', width: 35 },
        { key: 'note', width: 45 },
        { key: 'location', width: 25 }
      ];
      
      filteredLogs.forEach((log, index) => {
        const row = worksheet.addRow({
          date: new Date(log.timestamp).toLocaleDateString('id-ID'),
          time: new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          type: log.type === 'tbm' ? 'TBM (MULAI KERJA)' : 'SHIFT SELESAI',
          person: log.userName.toUpperCase(),
          project: (log.projectName || 'INTERNAL').toUpperCase(),
          note: (log.teamNote || '-').toUpperCase(),
          location: log.location || 'N/A'
        });
        
        row.height = 60; // Make row taller for image if needed
        row.eachCell(cell => {
           cell.alignment = { vertical: 'middle', wrapText: true };
           cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
        });

        // Add Image if exists
        if (log.photo && log.photo.startsWith('data:image')) {
          try {
            const imageId = workbook.addImage({
              base64: log.photo,
              extension: 'jpeg',
            });
            worksheet.addImage(imageId, {
              tl: { col: 7, row: row.number - 1 },
              ext: { width: 80, height: 80 },
              editAs: 'oneCell'
            });
          } catch (imgErr) {
            console.warn("Failed to add image to Excel:", imgErr);
          }
        }

        // Color coding for type
        const typeCell = row.getCell('type');
        if (log.type === 'tbm') {
           typeCell.font = { color: { argb: 'FF059669' }, bold: true }; // Emerald-600
        } else {
           typeCell.font = { color: { argb: 'FF2563EB' }, bold: true }; // Blue-600
        }
      });

      // Adjust column 8 for photos
      worksheet.getColumn(8).width = 15;
      worksheet.getCell('H3').value = 'FOTO / BUKTI';
      worksheet.getCell('H3').font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getCell('H3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      worksheet.getCell('H3').alignment = { horizontal: 'center' };
      worksheet.getCell('H3').border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };

      // --- ADDING SALARY SUMMARY SHEET ---
      const summarySheet = workbook.addWorksheet('RINGKASAN KEHADIRAN & GAJI');
      
      summarySheet.mergeCells('A1:E1');
      const sumTitle = summarySheet.getCell('A1');
      sumTitle.value = 'REKAPITULASI KEHADIRAN & GAJI PETUGAS';
      sumTitle.font = { bold: true, size: 14 };
      sumTitle.alignment = { horizontal: 'center' };

      summarySheet.addRow([]);

      const sumHeader = summarySheet.addRow(['NAMA PETUGAS', 'IDENTITAS/ID', 'JUMLAH HARI MASUK', 'GAJI HARIAN', 'JUMLAH KASBON', 'TOTAL GAJI DITERIMA']);
      sumHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sumHeader.eachCell(cell => {
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
         cell.alignment = { horizontal: 'center', vertical: 'middle' };
         cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
      });

      summarySheet.columns = [
        { key: 'name', width: 30 },
        { key: 'empId', width: 20 },
        { key: 'days', width: 20 },
        { key: 'rate', width: 20 },
        { key: 'advance', width: 20 },
        { key: 'total', width: 25 }
      ];

      // Group logs by worker email
      const workerSummary = new Map<string, {name: string, uniqueDays: Set<string>, workerObj?: any}>();
      filteredLogs.forEach(log => {
        const email = log.userEmail;
        const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
        
        if (!workerSummary.has(email)) {
          workerSummary.set(email, { 
            name: log.userName, 
            uniqueDays: new Set(),
            workerObj: workers.find(w => w.email?.toLowerCase() === email?.toLowerCase())
          });
        }
        workerSummary.get(email)?.uniqueDays.add(dateStr);
      });

      // Filter cash advances by the same date range if set
      const relevantAdvances = cashAdvances.filter(a => {
        const aDate = new Date(a.timestamp);
        if (startDate && aDate < new Date(startDate)) return false;
        if (endDate && aDate > new Date(new Date(endDate).getTime() + 86400000)) return false;
        return true;
      });

      workerSummary.forEach((data, email) => {
        const daysWorked = data.uniqueDays.size;
        const rate = data.workerObj?.dailyRate || 0;
        const grossSalary = daysWorked * rate;

        const workerAdvances = relevantAdvances.filter(a => a.workerEmail.toLowerCase() === email.toLowerCase());
        const totalAdvances = workerAdvances.reduce((sum, a) => sum + a.amount, 0);
        const netSalary = grossSalary - totalAdvances;

        const sumRow = summarySheet.addRow({
          name: data.name.toUpperCase(),
          empId: data.workerObj?.employeeId || email,
          days: daysWorked + ' HARI',
          rate: rate,
          advance: totalAdvances,
          total: netSalary
        });

        sumRow.getCell('rate').numFmt = '#,##0';
        sumRow.getCell('advance').numFmt = '#,##0';
        sumRow.getCell('total').numFmt = '#,##0';
        
        sumRow.eachCell(cell => {
           cell.alignment = { vertical: 'middle' };
           cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
        });
      });
      
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Laporan_Absensi_Shaka_${new Date().toISOString().split('T')[0]}.xlsx`);
      addNotification("Berhasil", "Laporan absensi profesional telah berhasil diekspor.", "success");
    } catch (e: any) {
      addNotification("Gagal", "Gagal mengekspor data: " + e.message, "error");
    }
  };

  const filteredLogs = attendanceLogs.filter(log => {
      const matchEmail = isAdmin ? true : log.userEmail === user?.email;
      const matchSearch = log.projectName?.toLowerCase().includes(historySearch.toLowerCase()) || 
                          log.userName?.toLowerCase().includes(historySearch.toLowerCase()) ||
                          log.teamNote?.toLowerCase().includes(historySearch.toLowerCase());
      
      const logDate = new Date(log.timestamp);
      const matchDate = !historyDateFilter || logDate.toISOString().split('T')[0] === historyDateFilter;
      
      const matchRange = (!startDate || logDate >= new Date(startDate)) && 
                         (!endDate || logDate <= new Date(new Date(endDate).getTime() + 86400000));
      
      return matchEmail && matchSearch && matchDate && matchRange;
  });

  const HseCheckItem = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
    <button 
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
        checked ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10" : "bg-muted/10 border-border opacity-60 hover:opacity-100"
      )}
    >
       <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all", 
         checked ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30")}>
          {checked && <Check className="w-4 h-4" />}
       </div>
       <span className={cn("text-[10px] font-black uppercase tracking-tight leading-tight", checked ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-primary mb-1">Absensi Lapangan</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3 h-3 text-emerald-500" />
            Laporan TBM & Selesai Kerja Tim
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted/30 p-1 rounded-2xl border border-white/5 shadow-inner relative group/tabs">
           {!isAdmin && (
             <button 
               onClick={() => setActiveSubTab('record')}
               className={cn(
                 "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 activeSubTab === 'record' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
               )}
             >
               Absen Sekarang
             </button>
           )}
           <button 
             onClick={() => setActiveSubTab('history')}
             className={cn(
               "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               activeSubTab === 'history' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
             )}
           >
             {isAdmin ? "Monitor Absensi" : "Riwayat"}
           </button>
           
           {isAdmin && (
             <div className="absolute top-full left-0 mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-64 shadow-xl z-50 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 mb-1">
                   <AlertCircle className="w-3 h-3 text-amber-500" />
                   <p className="text-[8px] font-black uppercase text-amber-600 italic">Anjuran Operasional</p>
                </div>
                <p className="text-[9px] font-bold text-amber-700/80 leading-relaxed uppercase">
                   REKAP ABSENSI & GAJI DISARANKAN DIUNDUH SETIAP 15-16 HARI SEKALI UNTUK OPTIMALISASI DATA.
                </p>
             </div>
           )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="wait">
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12"
            >
              <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setSelectedImage(null)} />
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative max-w-4xl w-full aspect-video rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-black"
              >
                <img src={selectedImage} className="w-full h-full object-contain" alt="Preview" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-rose-500 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {activeSubTab === 'record' ? (
            <motion.div 
              key="record"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-6 pb-24"
            >
              {showHseCheck ? (
                <Card className="p-8 border-2 border-emerald-500/30 bg-emerald-500/5 rounded-[2.5rem] shadow-2xl space-y-8 animate-in zoom-in duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 rotate-3">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter mt-4">Safety Induction & APD</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Verifikasi Keamanan Sebelum Absen Masuk</p>
                  </div>

                  <div className="space-y-3">
                    <HseCheckItem label="Memakai Alat Pelindung Diri (APD) Lengkap" checked={hsePPE} onChange={setHsePPE} />
                    <HseCheckItem label="Peralatan Kerja dalam Kondisi Layak" checked={hseTools} onChange={setHseTools} />
                    <HseCheckItem label="Area Kerja Aman dari Bahaya Lingkungan" checked={hseEnv} onChange={setHseEnv} />
                    <HseCheckItem label="Memahami Prosedur Keselamatan & Darurat" checked={hseInduction} onChange={setHseInduction} />
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <Button 
                      onClick={handleSubmit}
                      disabled={!hsePPE || !hseTools || !hseEnv || !hseInduction || isSubmitting}
                      className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase italic shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Check className="w-6 h-6" /> Konfirmasi & Absen Sekarang</>}
                    </Button>
                    <button 
                      onClick={() => setShowHseCheck(false)}
                      className="text-[10px] font-bold text-muted-foreground uppercase hover:text-primary transition-colors"
                    >
                      Kembali ke Pengisian Data
                    </button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 border-2 border-primary/10 overflow-hidden relative rounded-[2.5rem]">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Clock className="w-24 h-24" />
                  </div>
                  
                  <div className="relative z-10 space-y-6">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setAttendanceType('tbm')}
                         className={cn(
                           "p-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-2 transition-all",
                           attendanceType === 'tbm' ? "bg-emerald-500/10 border-emerald-500 shadow-xl shadow-emerald-500/10" : "bg-muted/10 border-transparent opacity-60 hover:opacity-100"
                         )}
                       >
                         <div className={cn("p-3 rounded-2xl", attendanceType === 'tbm' ? "bg-emerald-500 text-white" : "bg-muted")}>
                            <Users className="w-6 h-6" />
                         </div>
                         <span className="text-[10px] font-black uppercase italic tracking-widest">Toolbox Meeting</span>
                         <p className="text-[8px] opacity-60 text-center font-bold uppercase tracking-tight">Absen masuk & koordinasi tim (TBM)</p>
                       </button>

                       <button 
                         onClick={() => setAttendanceType('checkout')}
                         className={cn(
                           "p-4 rounded-[1.5rem] border-2 flex flex-col items-center gap-2 transition-all",
                           attendanceType === 'checkout' ? "bg-blue-500/10 border-blue-500 shadow-xl shadow-blue-500/10" : "bg-muted/10 border-transparent opacity-60 hover:opacity-100"
                         )}
                       >
                         <div className={cn("p-3 rounded-2xl", attendanceType === 'checkout' ? "bg-blue-500 text-white" : "bg-muted")}>
                            <CheckCircle2 className="w-6 h-6" />
                         </div>
                         <span className="text-[10px] font-black uppercase italic tracking-widest">Selesai Kerja</span>
                         <p className="text-[8px] opacity-60 text-center font-bold uppercase tracking-tight">Absen keluar & lapor progres hari ini</p>
                       </button>
                    </div>

                    {/* Project Selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground italic flex items-center gap-2">
                         <LayoutDashboard className="w-3 h-3 text-primary" />
                         Pilih Proyek Operasional
                      </label>
                      <select 
                         value={projectId}
                         onChange={(e) => setProjectId(e.target.value)}
                         className="w-full bg-muted/30 border-2 border-border/50 text-[11px] font-bold p-4 rounded-2xl focus:border-primary/50 outline-none transition-all uppercase"
                      >
                         <option value="">-- ILIH PROYEK --</option>
                         {projects.filter(p => !p.isArchived).map(p => (
                           <option key={p.id} value={p.id}>{p.name}</option>
                         ))}
                      </select>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground italic flex items-center gap-2">
                         <Send className="w-3 h-3 text-primary" />
                         Catatan & Progres Tim (Opsional)
                      </label>
                      <textarea 
                         value={note}
                         onChange={(e) => setNote(e.target.value)}
                         placeholder="Tuliskan catatan tim atau progres singkat..."
                         className="w-full bg-muted/30 border-2 border-border/50 text-[11px] font-bold p-4 rounded-2xl h-28 focus:border-primary/50 outline-none transition-all uppercase resize-none"
                      />
                    </div>

                    {/* Photo Capture */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground italic flex items-center gap-2">
                         <Camera className="w-3 h-3 text-primary" />
                         Dokumentasi {attendanceType === 'tbm' ? 'TBM (Masuk)' : 'Progress (Selesai)'}
                      </label>
                      
                      <div className="aspect-video rounded-[2rem] bg-muted/20 border-2 border-dashed border-border flex items-center justify-center relative overflow-hidden group transition-all hover:bg-muted/40">
                         {photo ? (
                           <>
                             <img src={photo} className="w-full h-full object-cover" alt="Capture" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setPhoto('')}
                                  className="bg-rose-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"
                                >
                                  <Trash2 className="w-6 h-6" />
                                </button>
                             </div>
                           </>
                         ) : (
                           <label className="flex flex-col items-center gap-3 cursor-pointer p-12 text-center">
                             <div className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg", isCapturing ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-white shadow-primary/20")}>
                                {isCapturing ? <RefreshCw className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                             </div>
                             <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary block">Ambil Foto Evidence</span>
                                <span className="text-[8px] font-bold text-muted-foreground uppercase block opacity-60 italic">Foto tim lengkap ber-APD untuk TBM</span>
                             </div>
                             <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} disabled={isCapturing} />
                           </label>
                         )}
                      </div>
                    </div>

                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting || !photo || !projectId}
                      className="w-full h-16 rounded-[2rem] text-sm uppercase italic font-black shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95 group"
                    >
                      {isSubmitting ? (
                         <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                         <>
                           <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                           Proses Absensi {attendanceType === 'tbm' ? 'TBM' : 'Keluar'}
                         </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Professional Footer Notice */}
              <div className="bg-muted/30 border border-border rounded-2xl p-6 flex gap-5 items-start">
                 <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-tight text-foreground italic leading-none">Standar Pelaporan Operasional</p>
                    <p className="text-[9px] font-medium text-muted-foreground leading-relaxed italic uppercase opacity-80">
                      Seluruh data absensi terekam secara permanen di Cloud. Pastikan foto dokumentasi mencakup seluruh personil tim dan latar belakang lokasi pengerjaan yang relevan.
                    </p>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 pb-24"
            >
              {/* History Search & Filters */}
              <div className="flex flex-col gap-4">
                 <Card className="p-3 bg-card border border-border flex items-center gap-3 rounded-2xl shadow-sm">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input 
                       type="text" 
                       placeholder="Cari Proyek, Nama, atau Catatan..."
                       className="bg-transparent border-none outline-none text-[10px] font-bold uppercase w-full"
                       value={historySearch}
                       onChange={(e) => setHistorySearch(e.target.value)}
                    />
                 </Card>
                 <div className="flex flex-wrap gap-2">
                    <Card className="p-3 bg-card border border-border flex items-center gap-3 rounded-2xl shadow-sm flex-1 min-w-[200px]">
                       <Calendar className="w-4 h-4 text-muted-foreground" />
                       <div className="flex items-center gap-2 w-full">
                          <input 
                             type="date" 
                             className="bg-transparent border-none outline-none text-[10px] font-bold uppercase w-full"
                             value={startDate}
                             onChange={(e) => setStartDate(e.target.value)}
                          />
                          <span className="text-[10px] font-black text-muted-foreground">→</span>
                          <input 
                             type="date" 
                             className="bg-transparent border-none outline-none text-[10px] font-bold uppercase w-full"
                             value={endDate}
                             onChange={(e) => setEndDate(e.target.value)}
                          />
                       </div>
                    </Card>
                    <div className="hidden sm:flex gap-2">
                       <Button 
                          onClick={exportAttendanceExcel}
                          disabled={filteredLogs.length === 0}
                          className="h-full px-4 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase italic bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                          title="Export Excel"
                       >
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel
                       </Button>
                       <Button 
                          onClick={exportAttendancePDF}
                          disabled={filteredLogs.length === 0}
                          className="h-full px-4 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase italic bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20"
                          title="Export PDF"
                       >
                          <FileText className="w-4 h-4" />
                          PDF
                       </Button>
                    </div>
                 </div>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-[3rem] border-2 border-dashed border-border opacity-50">
                   <Calendar className="w-16 h-16 mb-4 opacity-10" />
                   <p className="text-xs font-black uppercase tracking-[0.3em] italic">Tidak ada rekaman ditemukan</p>
                </div>
              ) : (
                <div className="overflow-hidden bg-card border-2 border-border/50 rounded-[2.5rem] shadow-xl">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-muted/50 border-b-2 border-border">
                              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Waktu & Personil</th>
                              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tipe</th>
                              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Proyek</th>
                              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Evidence</th>
                              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Catatan</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y border-border">
                           {filteredLogs.map((log) => (
                              <tr key={log.id} className="group hover:bg-primary/5 transition-colors">
                                 <td className="px-6 py-6 min-w-[200px]">
                                    <div className="flex flex-col">
                                       <span className="text-[11px] font-black uppercase italic text-primary leading-tight">{log.userName}</span>
                                       <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1">
                                          {new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-6">
                                    <Badge className={cn("text-[8px] font-black uppercase italic px-3 py-1 rounded-lg", 
                                      log.type === 'tbm' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20")}>
                                       {log.type === 'tbm' ? 'Toolbox Meeting' : 'Checkout'}
                                    </Badge>
                                 </td>
                                 <td className="px-6 py-6">
                                    <p className="text-[10px] font-black uppercase italic leading-tight max-w-[150px] truncate" title={log.projectName}>
                                       {log.projectName || 'Internal/NA'}
                                    </p>
                                 </td>
                                 <td className="px-6 py-6" onClick={() => setSelectedImage(log.photo)}>
                                    <div className="relative group/img cursor-pointer">
                                       <div className="w-16 h-10 rounded-xl overflow-hidden border-2 border-border shadow-sm group-hover/img:scale-110 transition-transform duration-300">
                                          <img src={log.photo} className="w-full h-full object-cover" alt="Log" />
                                       </div>
                                       <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] rounded-xl flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                          <Maximize2 className="w-3 h-3 text-white" />
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-6 max-w-[200px]">
                                    <p className="text-[9px] font-bold italic text-muted-foreground line-clamp-2 uppercase">
                                       {log.teamNote || '-'}
                                    </p>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}
              
              {/* Mobile Floating Export Hub */}
              {isAdmin && filteredLogs.length > 0 && activeSubTab === 'history' && (
                <div className="fixed bottom-28 right-6 z-[60] flex flex-col gap-4 sm:hidden">
                   <motion.button
                     initial={{ scale: 0, opacity: 0, y: 20 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={exportAttendanceExcel}
                     className="w-16 h-16 bg-emerald-500 text-white rounded-full shadow-[0_15px_30px_rgba(16,185,129,0.4)] flex items-center justify-center border-4 border-white dark:border-zinc-900"
                   >
                     <FileSpreadsheet className="w-7 h-7" />
                   </motion.button>
                   <motion.button
                     initial={{ scale: 0, opacity: 0, y: 20 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={exportAttendancePDF}
                     className="w-16 h-16 bg-rose-500 text-white rounded-full shadow-[0_15px_30px_rgba(244,63,94,0.4)] flex items-center justify-center border-4 border-white dark:border-zinc-900"
                   >
                     <FileText className="w-7 h-7" />
                   </motion.button>
                </div>
              )}

              {/* Report Footer */}
              <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                 <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black uppercase italic tracking-tighter">PT. Shaka Anugerah Karya</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Digital Attendance System v2.0</p>
                 </div>
                 <div className="flex items-center gap-8">
                    <div className="text-center">
                       <p className="text-xs font-black italic">{filteredLogs.length}</p>
                       <p className="text-[8px] font-black uppercase text-muted-foreground">Records</p>
                    </div>
                    <div className="text-center">
                       <p className="text-xs font-black italic">{filteredLogs.filter(l => l.type === 'tbm').length}</p>
                       <p className="text-[8px] font-black uppercase text-muted-foreground">TBM Logs</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
