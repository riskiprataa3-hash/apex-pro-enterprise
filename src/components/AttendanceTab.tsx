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
import { FirebaseImage } from './FirebaseImage';
import { SignaturePad } from './SignaturePad';
// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

export const AttendanceTab = () => {
  const { 
    user, 
    projects, 
    attendanceLogs, 
    handleCreateAttendance, 
    handleDeleteAttendance,
    handleDeleteAllAttendance,
    compressImageToFile,
    uploadFileToStorage,
    isAdmin,
    workers,
    cashAdvances,
    addNotification,
    needsInduction,
    handleCreateHseLog,
    handleGetLocation,
    location,
    isLocating,
    handleAddWorker,
    handleUpdateWorker,
    handleDeleteWorker,
    handleCreateCashAdvance,
    handleUpdateCashAdvance,
    handleDeleteCashAdvance
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'record' | 'history' | 'personnel' | 'kasbon'>(isAdmin ? 'history' : 'record');
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

  // Auto-get location when tab is active
  React.useEffect(() => {
    if (activeSubTab === 'record') {
      handleGetLocation();
    }
  }, [activeSubTab]);

  const selectedProject = projects.find(p => p.id === projectId);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCapturing(activeSubTab === 'kasbon');
    try {
      // Create object URL to load into image
      const tempUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = tempUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
        
        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        ctx.fillText(`Time: ${dateStr} ${timeStr}`, 20, canvas.height - 20);
      }
      
      const stampedFile = await new Promise<File>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            reject(new Error("Failed memproses gambar"));
          }
        }, 'image/jpeg', 0.9);
      });
      URL.revokeObjectURL(tempUrl);

      const compressed = await compressImageToFile(stampedFile, 800, 800, 0.7);
      const url = await uploadFileToStorage(compressed, `attendance/${user?.uid || 'unknown'}`);
      setPhoto(url);
    } catch (err: any) {
      addNotification("Failed", "Failed to upload photo: " + err.message, "error");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    if (!photo) {
      addNotification("Failed", "Photo requires attachment.", "warning");
      return;
    }
    if (!projectId) {
      addNotification("Failed", "Please select a project first.", "warning");
      return;
    }
    
    const msg = attendanceType === 'tbm' ? "Verify Check-In Attendance (TBM)? Today's status will start." : "Verify Check-Out Attendance? Daily Report automatically generated.";
    if (!window.confirm(msg)) return;

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
          addNotification("Warning", "All HSE/PPE points must be approved.", "warning");
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
    
    // Attempt with multiple proxies
    const proxies = [
      url, // Direct (fallback)
      "https://corsproxy.io/?" + encodeURIComponent(url)
    ];

    for (const proxyUrl of proxies) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) continue;
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.startsWith('image/')) continue;
        
        const blob = await response.blob();
        const b64 = await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            if (result && result.startsWith('data:image/')) resolve(result);
            else resolve(null);
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
        if (b64) return b64;
      } catch (e) {
        continue;
      }
    }

    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return preloadImageAsBase64(url, retries - 1);
    }
    return null;
  };

  const exportAttendancePDF = async () => {
    try {
      const jspdfModule = await import('jspdf');
      const jsPDF = (jspdfModule as any).jsPDF || (jspdfModule as any).default.jsPDF;
      
      const autoTableModule = await import('jspdf-autotable');
      let autoTable = (autoTableModule as any).default || autoTableModule;
      if (autoTable.default) autoTable = autoTable.default;

      addNotification("Info", "Menyiapkan ekspor PDF...", "info");
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Preload images in parallel
      const loadedImages: Record<string, string> = {};
      const uniqueUrls = Array.from(new Set(filteredLogs.map(l => l.photo).filter(Boolean)));
      
      addNotification("Info", `Memproses ${uniqueUrls.length} foto...`, "info");
      
      // Parallel processing with chunks to avoid overwhelming Browser/Memory
      const CHUNK_SIZE = 5;
      for (let i = 0; i < uniqueUrls.length; i += CHUNK_SIZE) {
        const chunk = uniqueUrls.slice(i, i + CHUNK_SIZE);
        const results = await Promise.all(chunk.map(url => preloadImageAsBase64(url!)));
        chunk.forEach((url, idx) => {
          if (results[idx]) loadedImages[url!] = results[idx]!;
        });
      }
      
      // --- HEADER BRANDING ---
      doc.setFillColor(15, 23, 42); // Slate-900 (More professional/Dark)
      doc.rect(0, 0, pageWidth, 55, 'F');
      
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('CPM (Core Pavement Management)', pageWidth / 2, 18, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('REKAPITULASI ABSENSI LAPANGAN', pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.text('PT. SHAKA ANUGERAH KARYA - DIGITAL MONITORING SYSTEM', pageWidth / 2, 40, { align: 'center' });
      
      if (startDate || endDate) {
        const range = `Periode: ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Awal'} s/d ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Sekarang'}`;
        doc.text(range, pageWidth / 2, 48, { align: 'center' });
      }

      // --- SUMMARY CARDS ---
      let currentY = 55;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, currentY, (pageWidth - 28) / 3 - 4, 25, 3, 3, 'FD');
      doc.roundedRect(14 + (pageWidth - 28) / 3, currentY, (pageWidth - 28) / 3 - 4, 25, 3, 3, 'FD');
      doc.roundedRect(14 + ((pageWidth - 28) / 3) * 2, currentY, (pageWidth - 28) / 3 - 4, 25, 3, 3, 'FD');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('TOTAL REKAMAN', 20, currentY + 8);
      doc.text('TOOLBOX MEETING', 20 + (pageWidth - 28) / 3, currentY + 8);
      doc.text('CHECKOUT / SELESAI', 20 + ((pageWidth - 28) / 3) * 2, currentY + 8);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${filteredLogs.length}`, 20, currentY + 18);
      doc.text(`${filteredLogs.filter(l => l.type === 'tbm').length}`, 20 + (pageWidth - 28) / 3, currentY + 18);
      doc.text(`${filteredLogs.filter(l => l.type === 'checkout').length}`, 20 + ((pageWidth - 28) / 3) * 2, currentY + 18);

      currentY += 35;

      // --- LOGS TABLE ---
      const tableRows = filteredLogs.map((log, i) => [
        (i + 1).toString(),
        new Date(log.timestamp).toLocaleDateString('id-ID'),
        new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        log.type === 'tbm' ? 'TBM' : 'CHECKOUT',
        log.userName.toUpperCase(),
        (log.projectName || 'INTERNAL').toUpperCase(),
        (log.teamNote || '-').toUpperCase(),
        '' // FOTO placeholder
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['NO', 'TANGGAL', 'WAKTU', 'TIPE', 'NAMA', 'PROYEK', 'CATATAN', 'FOTO']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8, halign: 'center' },
        bodyStyles: { fontSize: 7, textColor: [51, 65, 85], halign: 'center', minCellHeight: 40 },
        columnStyles: {
          4: { halign: 'left', fontStyle: 'bold' },
          5: { halign: 'left' },
          6: { halign: 'left' },
          7: { cellWidth: 50, halign: 'center', valign: 'middle' }
        },
        styles: { cellPadding: 3, valign: 'middle' },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 7) {
            const rowIndex = data.row.index;
            const log = filteredLogs[rowIndex];
            const imgData = loadedImages[log.photo];
            if (imgData && imgData.startsWith('data:image')) {
              try {
                const imgProps = doc.getImageProperties(imgData);
                const cellHeight = data.cell.height;
                const cellWidth = data.cell.width;
                const margin = 2;
                
                let renderProps: any = { w: cellWidth - margin*2, h: (cellWidth - margin*2) * (imgProps.height / imgProps.width) };
                if (renderProps.h > cellHeight - margin*2) {
                   renderProps.h = cellHeight - margin*2;
                   renderProps.w = renderProps.h * (imgProps.width / imgProps.height);
                }

                const x = data.cell.x + (cellWidth - renderProps.w) / 2;
                const y = data.cell.y + (cellHeight - renderProps.h) / 2;

                doc.addImage(imgData, 'JPEG', x, y, renderProps.w, renderProps.h);
              } catch (e) {
                console.warn('Could not draw image for PDF PDF cell', e);
              }
            }
          }
        }
      });

      // --- SALARY SUMMARY (Admin Only) ---
      if (isAdmin) {
        doc.addPage();
        doc.setFillColor(15, 118, 110); // Teal-700
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('RINGKASAN KEHADIRAN & RINCIAN GAJI', pageWidth / 2, 16, { align: 'center' });
        
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
          startY: 35,
          head: [['NAMA PERSONIL', 'ID KARYAWAN', 'KEHADIRAN', 'RATE / HARI', 'TOTAL KASBON', 'TOTAL GAJI']],
          body: summaryRows,
          theme: 'grid',
          headStyles: { fillColor: [15, 118, 110], fontSize: 9, halign: 'center' },
          bodyStyles: { fontSize: 8, halign: 'center' },
          columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
        });

        // --- SIGNATURE SECTION ---
        const finalY = (doc as any).lastAutoTable.finalY + 30;
        if (finalY + 50 > pageHeight) doc.addPage();
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.text('Dipersiapkan oleh,', 30, finalY);
        doc.text('Disetujui oleh,', pageWidth - 70, finalY);
        
        doc.setFont('helvetica', 'bold');
        doc.text(user?.displayName || 'Admin Sistem', 30, finalY + 35);
        doc.text('...............................', pageWidth - 70, finalY + 35);
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.text('Digital Signature Record', 30, finalY + 39);
        doc.text('Manager Lapangan', pageWidth - 70, finalY + 39);

        // --- ATTENDANCE PHOTOS APPENDIX ---
        doc.addPage();
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text('LAMPIRAN DOKUMENTASI VISUAL (EVIDENCE)', pageWidth / 2, 16, { align: 'center' });
        
        let pyPos = 35;
        let pxPos = 14;
        const imgWidth = 55;
        const imgHeight = 40;
        const gap = 10;

        filteredLogs.forEach((log, index) => {
           if (pyPos + imgHeight + 20 > 280) {
             doc.addPage();
             pyPos = 35;
           }
           
           try {
             const actualImg = loadedImages[log.photo];
             if (!actualImg || !actualImg.startsWith('data:image/')) {
               doc.setDrawColor(200);
               doc.rect(pxPos, pyPos, imgWidth, imgHeight);
               doc.setTextColor(150);
               doc.setFontSize(8);
               doc.text('FOTO TIDAK TERSEDIA', pxPos + 10, pyPos + 20);
             } else {
               let format = 'JPEG';
               if (actualImg.startsWith('data:image/png')) format = 'PNG';
               else if (actualImg.startsWith('data:image/webp')) format = 'WEBP';
               doc.addImage(actualImg, format, pxPos, pyPos, imgWidth, imgHeight);
               
               doc.setFillColor(255, 255, 255, 0.8);
               doc.rect(pxPos, pyPos + imgHeight - 8, imgWidth, 8, 'F');
               doc.setTextColor(30, 41, 59);
               doc.setFontSize(6);
               doc.setFont('helvetica', 'bold');
               doc.text(log.userName.substring(0, 15), pxPos + 2, pyPos + imgHeight - 5);
               doc.text(new Date(log.timestamp).toLocaleDateString('id-ID'), pxPos + 2, pyPos + imgHeight - 2);
               
               doc.setTextColor(100, 116, 139);
               doc.setFont('helvetica', 'normal');
               doc.text(`${log.type.toUpperCase()} - ${log.projectName || 'N/A'}`, pxPos, pyPos + imgHeight + 4);
             }
           } catch (e) {
             doc.rect(pxPos, pyPos, imgWidth, imgHeight);
           }

           pxPos += imgWidth + gap;
           if (pxPos + imgWidth > pageWidth - 14) {
             pxPos = 14;
             pyPos += imgHeight + 15;
           }
        });
      }

      // doc.save(`RecordAbsensi_Shaka_${new Date().toISOString().split('T')[0]}.pdf`);
      const fileName = `RecordAbsensi_Shaka_${new Date().toISOString().split('T')[0]}.pdf`;
      try {
        doc.save(fileName);
      } catch (e) {
        const blob = doc.output('blob');
        saveAs(blob, fileName);
      }
      addNotification("Success", "Laporan PDF Profesional telah berhasil diekspor.", "success");
    } catch (err: any) {
      console.error(err);
      addNotification("Failed", "Failed mengekspor PDF: " + err.message, "error");
    }
  };

  const exportAttendanceExcel = async () => {
    try {
      const ExcelJSModule = await import('exceljs');
      let ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;
      if (ExcelJS.default) ExcelJS = ExcelJS.default;
      
      addNotification("Info", "Menyiapkan ekspor Excel...", "info");
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('REKAP ABSENSI');

      // Preload images for Excel in parallel
      const loadedImages: Record<string, string> = {};
      const uniqueUrls = Array.from(new Set(filteredLogs.map(l => l.photo).filter(Boolean)));
      
      const CHUNK_SIZE = 5;
      for (let i = 0; i < uniqueUrls.length; i += CHUNK_SIZE) {
        const chunk = uniqueUrls.slice(i, i + CHUNK_SIZE);
        const results = await Promise.all(chunk.map(url => preloadImageAsBase64(url!)));
        chunk.forEach((url, idx) => {
          if (results[idx]) loadedImages[url!] = results[idx]!;
        });
      }
      
      // --- HEADER BRANDING ---
      worksheet.mergeCells('A1:H1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'CPM (Core Pavement Management) - REKAPITULASI ABSENSI LAPANGAN';
      titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' }, italic: true };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 45;

      worksheet.mergeCells('A2:H2');
      const companyCell = worksheet.getCell('A2');
      companyCell.value = 'PT. SHAKA ANUGERAH KARYA - DIGITAL MONITORING SYSTEM';
      companyCell.font = { bold: true, size: 11, color: { argb: 'FFE11D48' } }; // Rose-600
      companyCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(2).height = 30;

      const dateStr = `DICETAK PADA: ${new Date().toLocaleString('id-ID')}`;
      worksheet.mergeCells('A3:H3');
      worksheet.getCell('A3').value = dateStr;
      worksheet.getCell('A3').font = { italic: true, size: 9 };
      worksheet.getCell('A3').alignment = { horizontal: 'right' };
      
      worksheet.addRow([]); // Blank spacer

      // --- TABLE HEADERS ---
      const headerRow = worksheet.addRow(['NO', 'TANGGAL', 'WAKTU', 'KATEGORI', 'NAMA PERSONIL', 'PROYEK / LOKASI', 'CATATAN LAPANGAN', 'FOTO EVIDENCE']);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.height = 30;
      headerRow.eachCell((cell: any) => {
         cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }; // Slate-700
         cell.alignment = { horizontal: 'center', vertical: 'middle' };
         cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
      });

      worksheet.columns = [
        { key: 'no', width: 6 },
        { key: 'date', width: 15 },
        { key: 'time', width: 12 },
        { key: 'type', width: 22 },
        { key: 'person', width: 25 },
        { key: 'project', width: 35 },
        { key: 'note', width: 45 },
        { key: 'photo', width: 30 }
      ];
      
      // --- DATA ROWS ---
      for (let i = 0; i < filteredLogs.length; i++) {
        const log = filteredLogs[i];
        const row = worksheet.addRow({
          no: i + 1,
          date: new Date(log.timestamp).toLocaleDateString('id-ID'),
          time: new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          type: log.type === 'tbm' ? 'TBM (MULAI)' : 'CHECKOUT (SELESAI)',
          person: log.userName.toUpperCase(),
          project: (log.projectName || 'INTERNAL').toUpperCase(),
          note: (log.teamNote || '-').toUpperCase(),
          photo: ''
        });
        
        row.height = 90;
        row.eachCell((cell: any) => {
           cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
           cell.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
           cell.font = { size: 10 };
        });

        // Left align specific cells
        row.getCell('person').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        row.getCell('project').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        row.getCell('note').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

        // Color coding for type
        if (log.type === 'tbm') {
           row.getCell('type').font = { color: { argb: 'FF059669' }, bold: true };
           row.getCell('type').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
        } else {
           row.getCell('type').font = { color: { argb: 'FF2563EB' }, bold: true };
           row.getCell('type').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
        }

        // Add Image
        const imgB64 = loadedImages[log.photo];
        if (imgB64 && imgB64.startsWith('data:image')) {
          try {
            const base64Data = imgB64.split(',')[1];
            const extension = imgB64.includes('png') ? 'png' : 'jpeg';
            const imageId = workbook.addImage({ base64: base64Data, extension: extension as any });
            worksheet.addImage(imageId, {
              tl: { col: 7, row: row.number - 1 },
              ext: { width: 180, height: 110 },
              editAs: 'oneCell'
            });
          } catch (imgErr) {
            console.warn("Excel Image Error", imgErr);
          }
        }
      }

      // --- SUMMARY & SIGNATURE BLOCK ---
      const lastDataRow = worksheet.lastRow?.number || 5;
      const signY = lastDataRow + 3;

      worksheet.mergeCells(`B${signY}:C${signY}`);
      worksheet.getCell(`B${signY}`).value = 'Dipersiapkan oleh,';
      worksheet.getCell(`B${signY}`).font = { bold: true };
      
      worksheet.mergeCells(`F${signY}:G${signY}`);
      worksheet.getCell(`F${signY}`).value = 'Disetujui oleh,';
      worksheet.getCell(`F${signY}`).font = { bold: true };

      const nameY = signY + 4;
      worksheet.mergeCells(`B${nameY}:C${nameY}`);
      worksheet.getCell(`B${nameY}`).value = (user?.displayName || 'Admin Sistem').toUpperCase();
      worksheet.getCell(`B${nameY}`).font = { bold: true, underline: true };
      worksheet.getCell(`B${nameY}`).alignment = { horizontal: 'center' };

      worksheet.mergeCells(`F${nameY}:G${nameY}`);
      worksheet.getCell(`F${nameY}`).value = '...............................';
      worksheet.getCell(`F${nameY}`).alignment = { horizontal: 'center' };

      // --- SALARY SUMMARY SHEET ---
      if (isAdmin) {
        const salarySheet = workbook.addWorksheet('RINGKASAN GAJI');
        salarySheet.columns = [
          { header: 'NO', key: 'no', width: 6 },
          { header: 'NAMA PERSONIL', key: 'name', width: 30 },
          { header: 'ID KARYAWAN', key: 'id', width: 20 },
          { header: 'HARI KERJA', key: 'days', width: 15 },
          { header: 'RATE / HARI', key: 'rate', width: 20 },
          { header: 'TOTAL KASBON', key: 'advance', width: 20 },
          { header: 'GAJI NETTO', key: 'net', width: 25 }
        ];

        salarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        salarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
        salarySheet.getRow(1).height = 25;
        salarySheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

        const workerMap = new Map<string, {name: string, uniqueDays: Set<string>, workerObj?: any}>();
        filteredLogs.forEach(log => {
          const email = log.userEmail;
          const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
          if (!workerMap.has(email)) {
            workerMap.set(email, { 
              name: log.userName, 
              uniqueDays: new Set(),
              workerObj: workers.find(w => w.email?.toLowerCase() === email?.toLowerCase())
            });
          }
          workerMap.get(email)?.uniqueDays.add(dateStr);
        });

        const relevantAdvances = cashAdvances.filter(a => {
          const aDate = new Date(a.timestamp);
          if (startDate && aDate < new Date(startDate)) return false;
          if (endDate && aDate > new Date(new Date(endDate).getTime() + 86400000)) return false;
          return true;
        });

        let sIdx = 1;
        workerMap.forEach((data, email) => {
          const daysWorked = data.uniqueDays.size;
          const rate = data.workerObj?.dailyRate || 0;
          const gross = daysWorked * rate;
          const workerAdvances = relevantAdvances.filter(a => a.workerEmail.toLowerCase() === email.toLowerCase());
          const totalAdvances = workerAdvances.reduce((sum, a) => sum + a.amount, 0);
          const net = gross - totalAdvances;

          const sRow = salarySheet.addRow({
            no: sIdx++,
            name: data.name.toUpperCase(),
            id: data.workerObj?.employeeId || '-',
            days: daysWorked + ' HARI',
            rate,
            advance: totalAdvances,
            net
          });

          sRow.getCell('rate').numFmt = '#,##0';
          sRow.getCell('advance').numFmt = '#,##0';
          sRow.getCell('net').numFmt = '#,##0';
          sRow.eachCell((c: any) => {
             c.alignment = { vertical: 'middle', horizontal: 'center' };
             c.border = { top: { style:'thin' }, left: { style:'thin' }, bottom: { style:'thin' }, right: { style:'thin' } };
          });
          sRow.getCell('name').alignment = { horizontal: 'left' };
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `RekapAbsensi_Shaka_${new Date().toISOString().split('T')[0]}.xlsx`);
      addNotification("Success", "Data Excel Profesional telah berhasil diekspor.", "success");
    } catch (e: any) {
      addNotification("Failed", "Failed mengekspor Excel: " + e.message, "error");
    }
  };

  const filteredLogs = attendanceLogs.filter(log => {
      const matchEmail = isAdmin ? true : log.userEmail === user?.email;
      const matchSearch = (log.projectName || '').toLowerCase().includes(historySearch.toLowerCase()) || 
                          (log.userName || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                          (log.teamNote || '').toLowerCase().includes(historySearch.toLowerCase());
      
      const logDate = new Date(log.timestamp);
      
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if (end) end.setHours(23, 59, 59, 999);

      const matchRange = (!start || logDate >= start) && (!end || logDate <= end);
      
      return matchEmail && matchSearch && matchRange;
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
       <span className={cn("text-[10px] font-bold uppercase tracking-tight leading-tight", checked ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground")}>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-card backdrop-blur-sm p-4 sm:p-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tighter uppercase text-primary mb-1 leading-none">Rekapitulasi Absensi Lapangan</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3 h-3 text-emerald-500" />
            Monitoring Presensi & Toolbox Meeting Digital
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50 shadow-sm relative group/tabs">
           <button 
             onClick={() => setActiveSubTab('record')}
             className={cn(
               "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
               activeSubTab === 'record' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
             )}
           >
             Absen Sekarang
           </button>
           <button 
             onClick={() => setActiveSubTab('history')}
             className={cn(
               "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
               activeSubTab === 'history' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
             )}
           >
             {isAdmin ? "Monitor Absensi" : "Riwayat"}
           </button>
           
           {isAdmin && (
             <>
               <button 
                 onClick={() => setActiveSubTab('personnel')}
                 className={cn(
                   "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                   activeSubTab === 'personnel' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
                 )}
               >
                 Personil & Gaji
               </button>
               
             </>)}

            <button 
                 onClick={() => setActiveSubTab('kasbon')}
                 className={cn(
                   "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                   activeSubTab === 'kasbon' ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"
                 )}
               >
                 Kasbon
               </button>

           {isAdmin && (
             <div className="absolute top-full left-0 mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl w-64 shadow-xl z-50 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 mb-1">
                   <AlertCircle className="w-3 h-3 text-amber-500" />
                   <p className="text-[8px] font-bold uppercase text-amber-600 italic">Anjuran Operasional</p>
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
              <div className="absolute inset-0 bg-card backdrop-blur-xl" onClick={() => setSelectedImage(null)} />
              <motion.div 
                initial={{ scale: 0.9, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="relative max-w-4xl w-full aspect-video rounded-2xl overflow-hidden border-4 border-border/50 shadow-md bg-black"
              >
                <FirebaseImage url={selectedImage} className="w-full h-full object-contain" alt="Preview" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-5 right-6 w-12 h-12 bg-white/10 hover:bg-rose-500 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all shadow-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          )}

          {activeSubTab === 'record' && (
            <motion.div 
              key="record"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-6 pb-24"
            >
              {showHseCheck ? (
                <Card className="p-5 border border-emerald-500/30 bg-emerald-500/5 rounded-[2rem] shadow-md space-y-8 animate-in zoom-in duration-300">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 rotate-3">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold italic uppercase tracking-tighter mt-4">Safety Induction & APD</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Verifikasi Keamanan Sebelum Absen Masuk</p>
                  </div>

                  <div className="space-y-3">
                    <HseCheckItem label="Memakai Alat Pelindung Diri (APD) Lengkap" checked={hsePPE} onChange={setHsePPE} />
                    <HseCheckItem label="Peralatan Kerja dalam Kondisi Layak" checked={hseTools} onChange={setHseTools} />
                    <HseCheckItem label="Area Kerja Aman dari Bahaya Lingkungan" checked={hseEnv} onChange={setHseEnv} />
                    <HseCheckItem label="Understand Safety & Emergency Procedures" checked={hseInduction} onChange={setHseInduction} />
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <Button 
                      onClick={handleSubmit}
                      disabled={!hsePPE || !hseTools || !hseEnv || !hseInduction || isSubmitting}
                      className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase italic shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
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
                <Card className="p-5 border border-primary/10 overflow-hidden relative rounded-[2rem]">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Clock className="w-24 h-24" />
                  </div>
                  
                  {/* Location Status Badge */}
                  <div className="flex justify-end mb-4 relative z-20">
                     {location ? (
                       <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px] font-bold uppercase italic flex items-center gap-1 px-3 py-1.5 rounded-full">
                         <MapPin className="w-3 h-3" /> Lokasi Terverifikasi: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                       </Badge>
                     ) : (
                       <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px] font-bold uppercase italic flex items-center gap-1 px-3 py-1.5 rounded-full animate-pulse cursor-pointer" onClick={() => handleGetLocation()}>
                         {isLocating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />} 
                         {isLocating ? "Mencari Lokasi..." : "Klik untuk Verifikasi Lokasi"}
                       </Badge>
                     )}
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
                         <span className="text-[10px] font-bold uppercase italic tracking-widest">Toolbox Meeting</span>
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
                         <span className="text-[10px] font-bold uppercase italic tracking-widest">Done Kerja</span>
                         <p className="text-[8px] opacity-60 text-center font-bold uppercase tracking-tight">Absen keluar & lapor progres hari ini</p>
                       </button>
                    </div>

                    {/* Project Selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground italic flex items-center gap-2">
                         <LayoutDashboard className="w-3 h-3 text-primary" />
                         Pilih Proyek Operasional
                      </label>
                      <select 
                         value={projectId}
                         onChange={(e) => setProjectId(e.target.value)}
                         className="w-full bg-muted/30 border border-border/50 text-[11px] font-bold p-4 rounded-2xl focus:border-primary/50 outline-none transition-all uppercase"
                      >
                         <option value="">-- ILIH PROYEK --</option>
                         {projects.filter(p => !p.isArchived).map(p => (
                           <option key={p.id} value={p.id}>{p.name}</option>
                         ))}
                      </select>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground italic flex items-center gap-2">
                         <Send className="w-3 h-3 text-primary" />
                         Note & Progres Tim (Opsional)
                      </label>
                      <textarea 
                         value={note}
                         onChange={(e) => setNote(e.target.value)}
                         placeholder="Tuliskan catatan tim atau progres singkat..."
                         className="w-full bg-muted/30 border border-border/50 text-[11px] font-bold p-4 rounded-2xl h-28 focus:border-primary/50 outline-none transition-all uppercase resize-none"
                      />
                    </div>

                    {/* Photo Capture */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground italic flex items-center gap-2">
                         <Camera className="w-3 h-3 text-primary" />
                         Dokumentasi {attendanceType === 'tbm' ? 'TBM (Masuk)' : 'Progress (Done)'}
                      </label>
                      
                      <div className="aspect-video rounded-2xl bg-muted/20 border border-dashed border-border flex items-center justify-center relative overflow-hidden group transition-all hover:bg-muted/40">
                         {photo ? (
                           <>
                             <img src={photo} className="w-full h-full object-cover" alt="Capture" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setPhoto('')}
                                  className="bg-rose-500 text-white p-4 rounded-full shadow-md hover:scale-110 transition-transform"
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
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">Ambil Foto Evidence</span>
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
                      className="w-full h-16 rounded-2xl text-sm uppercase italic font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95 group"
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
              <div className="bg-muted/30 border border-border rounded-2xl p-5 flex gap-5 items-start">
                 <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-tight text-foreground italic leading-none">Standar Pelaporan Operasional</p>
                    <p className="text-[9px] font-medium text-muted-foreground leading-relaxed italic uppercase opacity-80">
                      Seluruh data absensi terekam secara permanen di Cloud. Pastikan foto dokumentasi mencakup seluruh personil tim dan latar belakang lokasi pengerjaan yang relevan.
                    </p>
                 </div>
              </div>
            </motion.div>
          )}
          
          {activeSubTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6 pb-24"
            >
              {/* History Search & Filters */}
              <div className="flex flex-col gap-4">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                    <Card className="p-4 bg-emerald-500/5 border-emerald-500/20 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                       <span className="text-[9px] font-bold uppercase text-emerald-600 mb-1">Total TBM</span>
                       <span className="text-2xl font-bold text-emerald-700">{filteredLogs.filter(l => l.type === 'tbm').length}</span>
                    </Card>
                    <Card className="p-4 bg-blue-500/5 border-blue-500/20 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                       <span className="text-[9px] font-bold uppercase text-blue-600 mb-1">Total Done</span>
                       <span className="text-2xl font-bold text-blue-700">{filteredLogs.filter(l => l.type === 'checkout').length}</span>
                    </Card>
                    <Card className="p-4 bg-primary/5 border-primary/20 rounded-[1.5rem] flex flex-col items-center justify-center text-center">
                       <span className="text-[9px] font-bold uppercase text-primary mb-1">Total Hari</span>
                       <span className="text-2xl font-bold text-primary">
                          {new Set(filteredLogs.map(l => new Date(l.timestamp).toDateString())).size}
                       </span>
                    </Card>
                 </div>

                 <Card className="p-3 bg-card border border-border flex items-center gap-3 rounded-[2rem] shadow-sm">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <input 
                       type="text" 
                       placeholder="Cari Proyek, Nama, atau Note..."
                       className="bg-transparent border-none outline-none text-[10px] font-bold uppercase w-full"
                       value={historySearch}
                       onChange={(e) => setHistorySearch(e.target.value)}
                    />
                 </Card>
                 <div className="flex flex-wrap gap-2">
                    <Card className="p-3 bg-card border border-border flex items-center gap-3 rounded-[2rem] shadow-sm flex-1 min-w-[200px]">
                       <Calendar className="w-4 h-4 text-muted-foreground" />
                       <div className="flex items-center gap-2 w-full">
                          <input 
                             type="date" 
                             className="bg-transparent border-none outline-none text-[10px] font-bold uppercase w-full"
                             value={startDate}
                             onChange={(e) => setStartDate(e.target.value)}
                          />
                          <span className="text-[10px] font-bold text-muted-foreground">→</span>
                          <input 
                             type="date" 
                             className="bg-transparent border-none outline-none text-[10px] font-bold uppercase w-full"
                             value={endDate}
                             onChange={(e) => setEndDate(e.target.value)}
                          />
                       </div>
                    </Card>
                    <div className="hidden sm:flex gap-2">
                       {isAdmin && filteredLogs.length > 0 && (
                         <Button 
                            onClick={() => handleDeleteAllAttendance()}
                            className="h-full px-4 rounded-2xl flex items-center gap-2 text-[10px] font-bold uppercase italic bg-rose-600/10 text-rose-600 border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                            title="Bersihkan Semua Data"
                         >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                         </Button>
                       )}
                       <Button 
                          onClick={exportAttendanceExcel}
                          disabled={filteredLogs.length === 0}
                          className="h-full px-4 rounded-2xl flex items-center gap-2 text-[10px] font-bold uppercase italic bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                          title="Export Excel"
                       >
                          <FileSpreadsheet className="w-4 h-4" />
                          Excel
                       </Button>
                       <Button 
                          onClick={exportAttendancePDF}
                          disabled={filteredLogs.length === 0}
                          className="h-full px-4 rounded-2xl flex items-center gap-2 text-[10px] font-bold uppercase italic bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20"
                          title="Export PDF"
                       >
                          <FileText className="w-4 h-4" />
                          PDF
                       </Button>
                    </div>
                 </div>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border opacity-50">
                   <Calendar className="w-16 h-16 mb-4 opacity-10" />
                   <p className="text-xs font-bold uppercase tracking-[0.3em] italic">Tidak ada rekaman ditemukan</p>
                </div>
              ) : (
                <div className="overflow-hidden bg-card border border-border/50 rounded-2xl shadow-xl">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="bg-muted/50 border-b-2 border-border">
                              <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Time & Personil</th>
                              <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Tipe</th>
                              <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Proyek</th>
                              <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Evidence</th>
                              <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Note</th>
                              {isAdmin && <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>}
                           </tr>
                        </thead>
                        <tbody className="divide-y border-border">
                           {filteredLogs.map((log) => (
                              <tr key={log.id} className="group hover:bg-primary/5 transition-colors">
                                 <td className="px-6 py-6 min-w-[200px]">
                                    <div className="flex flex-col">
                                       <span className="text-[11px] font-bold uppercase italic text-primary leading-tight">{log.userName}</span>
                                       <span className="text-[8px] font-bold text-muted-foreground uppercase mt-1">
                                          {new Date(log.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-6">
                                    <Badge className={cn("text-[8px] font-bold uppercase italic px-3 py-1 rounded-lg", 
                                      log.type === 'tbm' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20")}>
                                       {log.type === 'tbm' ? 'Toolbox Meeting' : 'Check-Out'}
                                    </Badge>
                                 </td>
                                 <td className="px-6 py-6">
                                    <p className="text-[10px] font-bold uppercase italic leading-tight max-w-[150px] truncate" title={log.projectName}>
                                       {log.projectName || 'Internal/NA'}
                                    </p>
                                 </td>
                                 <td className="px-6 py-6" onClick={() => setSelectedImage(log.photo)}>
                                    <div className="relative group/img cursor-pointer">
                                       <div className="w-16 h-10 rounded-xl overflow-hidden border border-border shadow-sm group-hover/img:scale-110 transition-transform duration-300">
                                          <FirebaseImage url={log.photo} className="w-full h-full object-cover" />
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
                                 {isAdmin && (
                                   <td className="px-6 py-6">
                                     <button 
                                       onClick={() => {
                                         if (window.confirm('Hapus record absensi ini?')) {
                                           handleDeleteAttendance(log.id);
                                         }
                                       }}
                                       className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                     >
                                       <Trash2 className="w-4 h-4" />
                                     </button>
                                   </td>
                                 )}
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
                     initial={{ scale: 0, opacity: 0, y: 10 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => {
                        if (window.confirm('Hapus seluruh data absensi?')) {
                          handleDeleteAllAttendance();
                        }
                     }}
                     className="w-16 h-16 bg-rose-600 text-white rounded-full shadow-[0_15px_30px_rgba(225,29,72,0.4)] flex items-center justify-center border-4 border-white dark:border-zinc-900"
                   >
                     <Trash2 className="w-7 h-7" />
                   </motion.button>
                   <motion.button
                     initial={{ scale: 0, opacity: 0, y: 10 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     transition={{ delay: 0.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={exportAttendanceExcel}
                     className="w-16 h-16 bg-emerald-500 text-white rounded-full shadow-[0_15px_30px_rgba(16,185,129,0.4)] flex items-center justify-center border-4 border-white dark:border-zinc-900"
                   >
                     <FileSpreadsheet className="w-7 h-7" />
                   </motion.button>
                   <motion.button
                     initial={{ scale: 0, opacity: 0, y: 10 }}
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
              <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-5 opacity-60 grayscale hover:grayscale-0 transition-all">
                 <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase italic tracking-tighter">PT. Shaka Anugerah Karya</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Digital Attendance System v2.0</p>
                 </div>
                 <div className="flex items-center gap-5">
                    <div className="text-center">
                       <p className="text-xs font-bold italic">{filteredLogs.length}</p>
                       <p className="text-[8px] font-bold uppercase text-muted-foreground">Records</p>
                    </div>
                    <div className="text-center">
                       <p className="text-xs font-bold italic">{filteredLogs.filter(l => l.type === 'tbm').length}</p>
                       <p className="text-[8px] font-bold uppercase text-muted-foreground">TBM Logs</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === 'personnel' && (
             <motion.div key="personnel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24">
                <PersonnelManagement workers={workers} handleAddWorker={handleAddWorker} handleUpdateWorker={handleUpdateWorker} handleDeleteWorker={handleDeleteWorker} isAdmin={isAdmin} user={user} />
             </motion.div>
          )}

          {activeSubTab === 'kasbon' && (
             <motion.div key="kasbon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24">
                <KasbonManagement 
                  cashAdvances={cashAdvances} 
                  handleCreateCashAdvance={handleCreateCashAdvance} 
                  workers={workers} 
                  isAdmin={isAdmin} 
                  handleDeleteCashAdvance={handleDeleteCashAdvance} 
                  handleUpdateCashAdvance={handleUpdateCashAdvance} 
                  uploadFileToStorage={uploadFileToStorage} 
                  user={user} 
                  compressImageToFile={compressImageToFile}
                  setSelectedImage={setSelectedImage}
                />
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PersonnelManagement = ({ workers, handleAddWorker, handleUpdateWorker, handleDeleteWorker, isAdmin, user }: any) => {
  const isDevAccount = user?.email?.toLowerCase() === 'developmentshaka@gmail.com' || user?.email?.toLowerCase() === 'development.shaka@gmail.com';
  
  const [isAdding, setIsAdding] = useState(false);
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'field-operator'>('field-operator');
  const [dailyRate, setDailyRate] = useState<number | ''>('');

  const generateEmpId = () => {
    const isPelaksana = role === 'field-operator';
    const prefix = isPelaksana ? 'SHK-PEL-' : 'SHK-ADM-';
    const roleWorkers = workers.filter((w: any) => isPelaksana ? w.role === 'field-operator' : w.role === 'admin');
    
    // Find highest ID
    let maxId = 0;
    roleWorkers.forEach((w: any) => {
      const match = w.employeeId.match(new RegExp(`${prefix}(\\d+)`));
      if (match) {
        maxId = Math.max(maxId, parseInt(match[1]));
      }
    });
    
    const newId = maxId + 1;
    return `${prefix}${newId.toString().padStart(3, '0')}`;
  };

  const handleOpenAdd = () => {
    setIsAdding(true);
    const newIdStr = generateEmpId();
    setEmpId(newIdStr);
    
    // Auto generate email and password based on new ID
    const isPelaksana = role === 'field-operator';
    const match = newIdStr.match(/\d+/);
    if (match) {
       const numStr = match[0].padStart(2, '0');
       setEmail(isPelaksana ? `pelaksana.shaka${numStr}@gmail.com` : `admin.shaka${numStr}@gmail.com`);
    } else {
       setEmail('');
    }
    setPassword('02242004');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    await handleAddWorker(empId, name, email, password, role, Number(dailyRate));
    setIsAdding(false);
    setEmpId('');
    setName('');
    setEmail('');
    setPassword('');
    setDailyRate('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-6">
       <div className="flex justify-between items-center bg-muted/20 p-4 rounded-2xl border border-border">
          <div>
            <h3 className="text-xl font-bold italic uppercase tracking-tighter text-primary line-clamp-1">Data Personil & Gaji</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-1">Kelola Pekerja Lapangan dan Staff</p>
          </div>
          {isDevAccount && (
            <Button onClick={handleOpenAdd} className="uppercase font-bold tracking-widest text-[10px] rounded-xl shadow-lg leading-none">+ Personil</Button>
          )}
       </div>

       {isAdding && (
         <Card className="p-5 border border-primary/20 bg-card backdrop-blur-sm rounded-[2rem] shadow-xl animate-in zoom-in-95 duration-200">
           <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-bold tracking-widest uppercase text-sm border-b border-border/50 pb-2 mb-4">Input Personil Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Role / Posisi</label>
                  <select 
                    value={role} 
                    onChange={(e) => {
                      setRole(e.target.value as any);
                      // Auto regenerate id
                      setTimeout(() => {
                         const isPelaksana = e.target.value === 'field-operator';
                         const prefix = isPelaksana ? 'SHK-PEL-' : 'SHK-ADM-';
                         const roleWorkers = workers.filter((w: any) => isPelaksana ? w.role === 'field-operator' : w.role === 'admin');
                         let maxId = 0;
                         roleWorkers.forEach((w: any) => {
                           const match = w.employeeId.match(new RegExp(`${prefix}(\\d+)`));
                           if (match) {
                             maxId = Math.max(maxId, parseInt(match[1]));
                           }
                         });
                         const newId = maxId + 1;
                         const newIdStr = `${prefix}${newId.toString().padStart(3, '0')}`;
                         setEmpId(newIdStr);
                         const match = newIdStr.match(/\d+/);
                         if (match) {
                            const numStr = match[0].padStart(2, '0');
                            setEmail(isPelaksana ? `pelaksana.shaka${numStr}@gmail.com` : `admin.shaka${numStr}@gmail.com`);
                         }
                      }, 100);
                    }}
                    className="w-full bg-background border border-input rounded-xl h-12 px-4 shadow-sm text-sm"
                  >
                    <option value="field-operator">Pelaksana Lapangan</option>
                    <option value="admin">Admin / Supervisor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">ID Karyawan</label>
                  <Input value={empId} onChange={e => setEmpId(e.target.value)} required placeholder="SHK-PEL-001" className="h-12 bg-muted/50 font-mono tracking-widest" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Nama Lengkap</label>
                  <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Mis. MUHAMAD RISKY" className="h-12 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Daily Salary (Rp)</label>
                  <Input type="number" required value={dailyRate} onChange={e => setDailyRate(Number(e.target.value))} placeholder="Misal: 150000" className="h-12 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Email / Akses ID</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="personilX@shaka.com" className="h-12" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Password / Kunci</label>
                  <Input type="text" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Sandi rahasia..." className="h-12" />
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-border/50 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="uppercase flex-1 font-bold tracking-widest text-[10px] rounded-xl h-12">Batal</Button>
                <Button type="submit" className="uppercase flex-1 font-bold tracking-widest text-[10px] rounded-xl h-12 bg-primary text-primary-foreground">Save Personnel</Button>
              </div>
           </form>
         </Card>
       )}

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {workers.map((w: any) => (
           <Card key={w.id} className="p-4 border-border/50 bg-card hover:bg-muted/20 transition-all rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={w.role === 'admin' ? 'primary' : 'outline'} className="text-[8px]">
                    {w.role === 'admin' ? 'ADMIN' : 'PELAKSANA'}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{w.employeeId}</span>
                </div>
                <h4 className="font-bold text-lg truncate uppercase leading-none mt-2">{w.name}</h4>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 line-clamp-1">{w.email}</p>
                <p className="text-sm font-bold mt-2 text-primary tracking-tight">Rp {Number(w.dailyRate || 0).toLocaleString('id-ID')} <span className="opacity-50 text-xs">/ HARI</span></p>
              </div>
              <div className="mt-4 pt-3 border-t border-border flex justify-end">
                {isDevAccount && (
                  <button onClick={() => {
                     if (window.confirm(`Hapus personil ${w.name}?`)) handleDeleteWorker(w.id);
                  }} className="text-rose-500 hover:bg-rose-500 hover:text-white transition-all p-2 rounded-xl">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
           </Card>
         ))}
       </div>
    </div>
  );
};

const KasbonManagement = ({ cashAdvances, handleCreateCashAdvance, handleDeleteCashAdvance, handleUpdateCashAdvance, uploadFileToStorage, workers, isAdmin, user, compressImageToFile, setSelectedImage }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [workerId, setWorkerId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [signatureData, setSignatureData] = useState('');

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approvedAmount, setApprovedAmount] = useState<number | ''>('');
  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedWorker = workers.find((w: any) => w.id === workerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker || !amount) return;
    await handleCreateCashAdvance({
      workerEmail: selectedWorker.email,
      workerName: selectedWorker.name,
      amount: Number(amount),
      note,
      signatureDataUrl: signatureData
    });
    setIsAdding(false);
    setAmount('');
    setNote('');
    setWorkerId('');
    setSignatureData('');
  };

  const handleApprove = async (ca: any) => {
    if (!approvedAmount) return;
    setIsUploading(true);
    let transferProofUrl = '';
    try {
      if (transferProofFile && compressImageToFile) {
         // Compress file first so mobile devices don't struggle or timeout on raw uploads
         const compressed = await compressImageToFile(transferProofFile, 1000, 1000, 0.7);
         transferProofUrl = await uploadFileToStorage(compressed, `kasbon_proofs/${ca.id}`);
      } else if (transferProofFile) {
         transferProofUrl = await uploadFileToStorage(transferProofFile, `kasbon_proofs/${ca.id}`);
      }
      
      await handleUpdateCashAdvance(ca.id, {
        status: 'approved',
        approvedAmount: Number(approvedAmount),
        transferProofUrl: transferProofUrl || undefined
      });
      
      setProcessingId(null);
      setApprovedAmount('');
      setTransferProofFile(null);
    } catch (err: any) {
      console.error("Failed to approve kasbon & upload proof:", err);
      alert("Failed memproses persetujuan kasbon: " + (err.message || 'Koneksi error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Tolak pengajuan kasbon ini?')) {
      await handleUpdateCashAdvance(id, { status: 'rejected' });
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Disetujui</Badge>;
      case 'rejected': return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">Ditolak</Badge>;
      case 'pending': 
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Menunggu</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-6">
       <div className="flex justify-between items-center bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
          <div>
            <h3 className="text-xl font-bold italic uppercase tracking-tighter text-amber-600 line-clamp-1">Manajemen Kasbon</h3>
            <p className="text-[10px] text-amber-700/80 uppercase font-bold tracking-widest leading-none mt-1">Pengajuan & Pencatatan Kasbon</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-amber-500 hover:bg-amber-600 text-white uppercase font-bold tracking-widest text-[10px] rounded-xl shadow-lg leading-none">+ {isAdmin ? 'Catat' : 'Ajukan'}</Button>
       </div>

       {isAdding && (
         <Card className="p-5 border border-amber-500/20 bg-card backdrop-blur-sm rounded-[2rem] shadow-xl animate-in zoom-in-95 duration-200">
           <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-bold tracking-widest uppercase text-sm border-b border-border/50 pb-2 mb-4 text-amber-600">Form New Loan</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Pilih Personil</label>
                <select 
                  required
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl h-12 px-4 shadow-sm text-sm uppercase font-bold text-primary"
                >
                  <option value="">-- PILIH PEKERJA --</option>
                  {workers.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.employeeId}) - Rate: Rp{Number(w.dailyRate || 0).toLocaleString('id-ID')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{isAdmin ? 'Nominal (Rp)' : 'Nominal Pengajuan (Rp)'}</label>
                <Input type="number" required value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="Contoh: 50000" className="h-12 font-mono text-lg font-bold tracking-wider" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Keterangan / Tujuan</label>
                <Input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Mis. Bensin, Makan siang..." className="h-12" />
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Tanda Tangan Pemohon</label>
                 <SignaturePad onSave={setSignatureData} onClear={() => setSignatureData('')} />
              </div>

              <div className="flex gap-4 pt-4 border-t border-border/50 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="uppercase flex-1 font-bold tracking-widest text-[10px] rounded-xl h-12">Batal</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white uppercase flex-1 font-bold tracking-widest text-[10px] rounded-xl h-12">{isAdmin ? 'Cairkan Kasbon' : 'Kirim Pengajuan'}</Button>
              </div>
           </form>
         </Card>
       )}

       <div className="space-y-3">
         {cashAdvances.sort((a: any, b: any) => b.timestamp - a.timestamp).map((ca: any) => (
           <Card key={ca.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border-l-4 border-l-amber-500 bg-card hover:bg-muted/20 transition-all rounded-2xl rounded-l-none gap-4">
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                 <p className="text-[10px] font-bold text-muted-foreground">{new Date(ca.timestamp).toLocaleString('id-ID')}</p>
                 {getStatusBadge(ca.status)}
               </div>
               <h4 className="font-bold text-lg uppercase tracking-tight leading-none mb-1">{ca.workerName}</h4>
               <p className="text-xs text-muted-foreground">{ca.note || 'Tanpa keterangan'}</p>
               {ca.signatureDataUrl && (
                 <div className="mt-2 bg-white rounded-lg p-1 w-24 border border-slate-200">
                    <img src={ca.signatureDataUrl} alt="Tanda Tangan" className="w-full h-auto" />
                    <p className="text-[8px] text-center text-slate-400 mt-1 uppercase font-bold tracking-widest leading-none">Ditandatangani</p>
                 </div>
               )}
               <p className="text-[9px] text-muted-foreground mt-2">Diajukan oleh: {ca.createdByName}</p>
             </div>
             
             <div className="flex flex-col items-start sm:items-end gap-2 text-right w-full sm:w-auto">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Pengajuan:</p>
                  <span className="font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-500/20 shadow-sm block">
                    Rp {ca.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                {ca.status === 'approved' && ca.approvedAmount && (
                  <div className="text-left sm:text-right mt-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-1">Disetujui:</p>
                    <span className="font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20 shadow-sm block">
                      Rp {ca.approvedAmount.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                {ca.status === 'approved' && ca.transferProofUrl && (
                  <button 
                    type="button"
                    onClick={() => setSelectedImage && setSelectedImage(ca.transferProofUrl)} 
                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1 mt-1 bg-transparent border-0 cursor-pointer p-0 outline-none"
                  >
                    <Search className="w-3 h-3" /> Lihat Bukti Transfer
                  </button>
                )}
             </div>

             <div className="flex flex-col items-stretch gap-2 pt-4 sm:pt-0 border-t sm:border-0 border-border/50">
               {isAdmin && ca.status !== 'approved' && ca.status !== 'rejected' && processingId !== ca.id && (
                 <Button size="sm" onClick={() => { setProcessingId(ca.id); setApprovedAmount(ca.amount); }} variant="outline" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 w-full sm:w-auto">
                   <Check className="w-4 h-4 mr-1" /> Proses
                 </Button>
               )}
               {isAdmin && (ca.status === 'approved' || ca.status === 'rejected') && (
                 <Button size="sm" onClick={() => { if(window.confirm('Hapus histori kasbon ini?')) handleDeleteCashAdvance(ca.id); }} variant="ghost" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 w-full sm:w-auto">
                   <Trash2 className="w-4 h-4" />
                 </Button>
               )}
               
               {processingId === ca.id && (
                 <div className="p-3 bg-muted/30 rounded-xl space-y-3 border border-border w-full sm:w-64">
                   <div>
                     <label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Setujui Nominal (Rp)</label>
                     <Input type="number" value={approvedAmount} onChange={e => setApprovedAmount(Number(e.target.value))} className="h-8 text-sm" />
                   </div>
                   <div>
                     <label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Bukti Transfer (Opsional)</label>
                     <Input type="file" accept="image/*" onChange={e => setTransferProofFile(e.target.files?.[0] || null)} className="text-[10px]" />
                   </div>
                   <div className="flex gap-2">
                     <Button size="sm" onClick={() => handleApprove(ca)} disabled={isUploading} className="flex-1 text-[10px] bg-emerald-500 hover:bg-emerald-600">
                       {isUploading ? 'Menyimpan...' : 'Simpan'}
                     </Button>
                     <Button size="sm" onClick={() => handleReject(ca.id)} variant="outline" className="flex-1 text-[10px] text-rose-500">
                       Tolak
                     </Button>
                     <Button size="sm" onClick={() => setProcessingId(null)} variant="ghost" className="px-2">
                       <X className="w-4 h-4 text-muted-foreground" />
                     </Button>
                   </div>
                 </div>
               )}
             </div>
           </Card>
         ))}
       </div>
    </div>
  );
};
