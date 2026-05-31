// import { jsPDF } from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { auth, storage } from '../firebase';
import { ref, getDownloadURL, getBytes } from 'firebase/storage';
import { Project } from '../context/AppContext';

// Global cache for PDF images
const pdfImageCache: Record<string, string> = {};

export const preloadImageAsBase64 = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;
  if (pdfImageCache[url]) return pdfImageCache[url];

  // Tingkatkan timeout global per gambar menjadi 45 detik untuk menghindari timeout saat download concurrent
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 45000));

  const runLogic = async (): Promise<string | null> => {
    const resizeImageBlob = (blob: Blob): Promise<string> => new Promise((resolve) => {
        const objUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height;
            const MAX = 400;
            if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
            else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            } else { resolve(''); }
            URL.revokeObjectURL(objUrl);
        };
        img.onerror = () => { resolve(''); URL.revokeObjectURL(objUrl); };
        img.src = objUrl;
    });

    const getPathFromUrl = (u: string) => {
      if (u.startsWith('https://firebasestorage.googleapis.com/')) {
        const match = u.match(/\/o\/([^?]+)/);
        if (match) {
          let p = match[1];
          try { return decodeURIComponent(p); } catch(e) { return p; }
        }
      }
      return null;
    };

    const fetchWithTimeout = async (proxyUrl: string, ms: number = 20000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(id);
            if (response.ok) {
                const blob = await response.blob();
                const b64 = await resizeImageBlob(blob);
                if (b64 && b64.startsWith('data:image/')) {
                    return b64;
                }
            }
        } catch (e) { clearTimeout(id); }
        throw new Error('Fetch failed');
    };

    const encodedUrl = encodeURIComponent(url);
    const proxies = [
      `https://wsrv.nl/?url=${encodedUrl}&output=jpeg&q=15&w=250`,
      `/api/proxy?url=${encodedUrl}`
    ];

    for (const proxyUrl of proxies) {
      try {
        const result = await fetchWithTimeout(proxyUrl, 8000); 
        if (result && result.startsWith('data:image/')) {
          pdfImageCache[url] = result;
          return result;
        }
      } catch (e) {
        continue;
      }
    }

    const path = getPathFromUrl(url);
    if (path) {
        try {
            const fileRef = ref(storage, path);
            const bytes = await getBytes(fileRef);
            const blob = new Blob([bytes], { type: 'image/jpeg' });
            const b64 = await resizeImageBlob(blob);
            if (b64 && b64.startsWith('data:image/')) {
                pdfImageCache[url] = b64;
                return b64;
            }
        } catch(e) { }
    }

    return null;
  };

  return Promise.race([runLogic(), timeoutPromise]);
};

export let overlay: HTMLDivElement | null = null;
export let progressText: HTMLParagraphElement | null = null;
export let progressBar: HTMLDivElement | null = null;
export let percentageText: HTMLParagraphElement | null = null;

export const createOverlay = () => {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity";
    
    overlay.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center transform transition-all scale-100 dark:bg-slate-900 border border-slate-800">
        <div class="flex justify-center mb-6">
          <svg class="animate-spin h-12 w-12 text-blue-600 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Harap Tunggu...</h3>
        <p id="pdf-status-text" class="text-sm text-gray-500 font-medium mb-6 dark:text-slate-400">
          Menyiapkan dokumen PDF...
        </p>
        <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-2 overflow-hidden">
          <div id="pdf-progress-bar" class="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out" style="width: 0%"></div>
        </div>
        <p id="pdf-percentage-text" class="text-right text-xs font-bold text-blue-600 dark:text-blue-500">
          0%
        </p>
      </div>
    `;
    document.body.appendChild(overlay);
    progressText = document.getElementById('pdf-status-text') as HTMLParagraphElement;
    progressBar = document.getElementById('pdf-progress-bar') as HTMLDivElement;
    percentageText = document.getElementById('pdf-percentage-text') as HTMLParagraphElement;
};

export const updateProgress = (text: string, value: number) => {
    if (progressText) progressText.innerText = text;
    if (progressBar) progressBar.style.width = `${value}%`;
    if (percentageText) percentageText.innerText = `${value}%`;
};

export const removeOverlay = (successMsg?: string) => {
    if (successMsg && progressText) {
       progressText.innerText = successMsg;
       const spinner = overlay?.querySelector('svg');
       if (spinner) {
           spinner.classList.remove('animate-spin', 'text-blue-600', 'dark:text-blue-500');
           spinner.classList.add('text-emerald-500');
           spinner.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
       }
       if (progressBar) progressBar.classList.add('bg-emerald-500');
       updateProgress(successMsg, 100);
       setTimeout(() => {
           if (overlay) overlay.remove();
           overlay = null;
       }, 1500);
       return;
    }
    if (overlay) {
        overlay.remove();
        overlay = null;
    }
};

export const exportPDF = async (currentProject: any, dataToExport: any[], signature?: { name: string, role: string }, allEntries?: any[], onProgress?: (msg: string, val: number) => void) => {
  const jspdfModule = await import('jspdf');
  const jsPDF = (jspdfModule as any).jsPDF || (jspdfModule as any).default.jsPDF;
  
  const autoTableModule = await import('jspdf-autotable');
  let autoTable = (autoTableModule as any).default || autoTableModule;
  if (autoTable.default) autoTable = autoTable.default;

  const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4', compress: true });
  const timestamp = new Date().getTime();
  
  // Summary Box & Stats Calculation
  const activeEntries = dataToExport.filter(e => !e.isArchived);
  const totalEntries = activeEntries.length;
  const completedCount = activeEntries.filter(e => e.status === 'completed').length;

  // Robust photo detection
  const getEntryPhotos = (entry: any): string[] => {
    if (!entry) return [];
    const photos = new Set<string>();
    
    if (entry.photo0) photos.add(entry.photo0);
    if (entry.photo50) photos.add(entry.photo50);
    if (entry.photo100) photos.add(entry.photo100);

    const specificKeys = ['photos0', 'photos50', 'photos100', 'images', 'documentation', 'photos'];
    specificKeys.forEach(k => {
      const val = entry[k];
      if (Array.isArray(val)) val.forEach(v => { if (typeof v === 'string' && v.length > 10) photos.add(v); });
    });
    Object.keys(entry).forEach(k => {
      const val = entry[k];
      if (typeof val === 'string' && val.length > 10 && (val.startsWith('http') || val.startsWith('data:image'))) photos.add(val);
      else if (Array.isArray(val)) val.forEach(v => { if (typeof v === 'string' && v.length > 10 && (v.startsWith('http') || v.startsWith('data:image'))) photos.add(v); });
    });
    return Array.from(photos);
  };

  const loadedImages: Record<string, string> = {};
  const urlsToLoad = new Set<string>();
  activeEntries.forEach(e => {
    getEntryPhotos(e).forEach(url => urlsToLoad.add(url));
  });
  const urlArray = Array.from(urlsToLoad);
  
  if (onProgress) onProgress(`Memulai unduhan foto (0/${urlArray.length})...`, 5);
  // Peningkatan concurrency agar lebih cepat tapi stabil (bukan 15 yang menyebabkan browser antre)
  const CONCURRENCY = 15;
  let downloadedCount = 0;
  let activeIndex = 0;
  
  const worker = async () => {
    while (activeIndex < urlArray.length) {
      const idx = activeIndex++;
      const url = urlArray[idx];
      const b64 = await preloadImageAsBase64(url);
      if (b64) loadedImages[url] = b64;
      downloadedCount++;
      if (onProgress) {
          const progressValue = 5 + Math.round((downloadedCount / urlArray.length) * 90);
          onProgress(`Mengunduh foto ${downloadedCount}/${urlArray.length}...`, progressValue);
      }
    }
  };

  const workers = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  
  if (onProgress) onProgress('Menyusun halaman PDF...', 95);

  
  const targetQty = currentProject?.targetQty || 0;
  
  // Use allEntries if available to calculate overall progress, otherwise fallback to activeEntries
  const sourceEntriesForStats = (allEntries && allEntries.length > 0) ? allEntries.filter(e => !e.isArchived) : activeEntries;
  
  const isPekanbaruDumai = currentProject?.name?.toUpperCase()?.includes('PEKANBARU-DUMAI') && currentProject?.type === 'inlet';
  
  const dbQtyForPDF = sourceEntriesForStats.reduce((sum, e) => {
    if (currentProject?.type === 'asphalt') return sum + (Number(e.tonase) || 0);
    return sum + (Number(e.qty) || 0);
  }, 0);

  const manualAddition = isPekanbaruDumai ? 401 : 0;

  const realizedQty = dbQtyForPDF + manualAddition;
  const remainingQty = Math.max(0, targetQty - realizedQty);
  const realizationProgress = targetQty > 0 ? Math.round((realizedQty / targetQty) * 100) : 0;
  const unit = currentProject?.type === 'asphalt' ? 'TONASE (T)' : currentProject?.type === 'painting' ? 'LUAS (M2)' : 'PCS/QTY';

  // Title & Header Area
  doc.setFillColor(15, 23, 42); // Darker Slate for professional look
  doc.rect(0, 0, 842, 65, 'F');
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  const projectTypeTitle = (currentProject?.type === 'inlet' ? 'PEMASANGAN INLET' :
                           currentProject?.type === 'asphalt' ? 'PENCATATAN PENGASPALAN' : 
                           currentProject?.type === 'traffic-sign' ? 'PEMASANGAN RAMBU LALU LINTAS' : 
                           currentProject?.type === 'painting' ? 'MARKA JALAN / PAINTING' : 
                           currentProject?.type === 'planting' ? 'PENANAMAN VEGETASI' : 'MONITORING PEKERJAAN');
  doc.text(String(`LAPORAN MONITORING ${projectTypeTitle}`), 40, 42);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(String(`TOLL-GUARD CPM | DOKUMEN RESMI REALISASI LAPORAN`), 40, 54);
  doc.text(String(`WAKTU CETAK: ${new Date().toLocaleString('id-ID')}`), 802, 42, { align: 'right' });

  // Project Info Area
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(String(`PROYEK: ${currentProject?.name?.toUpperCase() || '-'}`), 40, 90);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(String(`Location Strategis: Jalan Tol Trans Sumatera / Regional SUMBAGTENG`), 40, 105);
  doc.text(String(`Date Report: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`), 40, 118);

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(40, 130, 802, 130); 

  // Summary Box Position
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(40, 140, 762, 50, 4, 4, 'FD'); 

  const boxWidth = 762 / 4;
  const summaryY = 165;
  const labelY = 178;
  
  // Total Target
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(String(targetQty.toLocaleString('id-ID') || '0'), 40 + (boxWidth/2), summaryY, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(String(`TARGET (${unit})`), 40 + (boxWidth/2), labelY, { align: 'center' });

  // Realization
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); 
  doc.text(String(realizedQty.toLocaleString('id-ID') || '0'), 40 + boxWidth + (boxWidth/2), summaryY, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(String(`REALISASI (${realizationProgress}%)`), 40 + boxWidth + (boxWidth/2), labelY, { align: 'center' });

  // Remaining
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); 
  doc.text(String(remainingQty.toLocaleString('id-ID') || '0'), 40 + (boxWidth*2) + (boxWidth/2), summaryY, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(String(`SISA TARGET (${unit})`), 40 + (boxWidth*2) + (boxWidth/2), labelY, { align: 'center' });

  // Status Titik
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(String(`${completedCount}/${totalEntries}`), 40 + (boxWidth*3) + (boxWidth/2), summaryY, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('ITEM SELESAI', 40 + (boxWidth*3) + (boxWidth/2), labelY, { align: 'center' });

  // Disclaimer Font
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(String(`* Seluruh data merupakan hasil input langsung dari lapangan yang disinkronisasi melalui sistem cloud.`), 40, 205);


  // Table Data
  doc.setTextColor(0, 0, 0); 

  let head = [['No.', 'KM / Jalur', 'Detail', 'Detail Progres & Dokumentasi', 'Status']];
  
  if (currentProject?.type === 'asphalt') {
    head = [['No.', 'KM / Lane', 'Detail Aspal', 'Detail Progres & Dokumentasi', 'Status']];
  } else if (currentProject?.type === 'traffic-sign') {
    head = [['No.', 'KM / STA', 'Sign Type', 'Detail Progres & Dokumentasi', 'Status']];
  } else if (currentProject?.type === 'painting') {
    head = [['No.', 'Range KM', 'Objek & Luas', 'Detail Progres & Dokumentasi', 'Status']];
  } else if (currentProject?.type === 'planting') {
    head = [['No.', 'KM / STA', 'Tanaman', 'Detail Progres & Dokumentasi', 'Status']];
  } else if (currentProject?.type === 'inlet') {
    head = [['No.', 'KM / STA', 'Ukuran Inlet', 'Detail Progres & Dokumentasi', 'Status']];
  }

  const sortedData = [...dataToExport];

  const bodyData = sortedData.map((entry, index) => {
    if (!entry) return [String(index + 1), '-', '-', '', 'PENDING'];
    
    let col1 = `KM: ${entry.km || '-'}\nLOKASI:\nLat: ${entry.latitude ? Number(entry.latitude).toFixed(6) : '-'}\nLon: ${entry.longitude ? Number(entry.longitude).toFixed(6) : '-'}`;
    let col2 = '';
    
    if (currentProject?.type === 'asphalt') {
       col2 = `LAJUR: ${entry.lajur || '-'}\nDIMENSI: ${entry.panjang || 0}m x ${entry.lebar || 0}m\nTEBAL: ${entry.tebal || 0} cm\nMATERIAL: ${entry.materialType || '-'}\nVOLUME: ${entry.volume ? Number(entry.volume).toFixed(3) : 0} m³\nTONASE: ${entry.tonase ? Number(entry.tonase).toFixed(3) : 0} T`;
    } else if (currentProject?.type === 'traffic-sign') {
       col2 = `TIPE: ${entry.signType || '-'}\nJUMLAH: ${entry.qty || 0} Unit\nSPESIFIKASI: Standar Toll`;
    } else if (currentProject?.type === 'painting') {
       col1 = `LOKASI:\n${entry.km || '-'} s/d ${entry.kmTo || '-'}\nKOORDINAT:\n${entry.latitude ? Number(entry.latitude).toFixed(6) : '-'}, ${entry.longitude ? Number(entry.longitude).toFixed(6) : '-'}`;
       col2 = `OBJEK: ${entry.signType || '-'}\nLUAS: ${entry.qty || 0} m²\nWARNA: White/Yellow`;
    } else if (currentProject?.type === 'planting') {
       col2 = `VEGETASI: ${entry.plantType || '-'}\nJUMLAH: ${entry.qty || 0} Batang\nTANAH: Humus Mix`;
    } else if (currentProject?.type === 'inlet') {
       col2 = `UKURAN: ${entry.signType || '-'}\nQTY: ${entry.qty || 0} PCS/QTY`;
    } else {
       col2 = `DETAIL: ${entry.signType || '-'}\nVOLUME: ${entry.qty || 0} PCS/QTY`;
    }

    let statusText = entry.status === 'completed' ? '100% DONE' : entry.status === 'in-progress' ? '50% PROSES' : 'PENDING';

    return [`No. ${index + 1}`, col1, col2, '', statusText];
  });

  autoTable(doc, {
    startY: 215,
    head: head,
    body: bodyData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
      valign: 'middle'
    },
    styles: {
      fontSize: 7,
      valign: 'middle',
      cellPadding: 6,
      lineColor: [226, 232, 240]
    },
    columnStyles: {
      0: { cellWidth: 35, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 95 },
      3: { cellWidth: 440, minCellHeight: 210 }, 
      4: { cellWidth: 127, halign: 'center' } 
    },
    rowPageBreak: 'avoid',
    didDrawCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 4) {
        const text = data.cell.text[0];
        let bgColor = [241, 245, 249]; 
        let txtColor = [71, 85, 105];
        if (text === '100% DONE') {
          bgColor = [209, 250, 229];
          txtColor = [5, 150, 105];
        } else if (text === '50% PROSES') {
          bgColor = [254, 249, 195];
          txtColor = [161, 98, 7];
        }
        
        doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        const badgeW = 100;
        const badgeH = 18;
        const posX = data.cell.x + (data.cell.width / 2) - (badgeW / 2);
        const posY = data.cell.y + (data.cell.height / 2) - (badgeH / 2);

        doc.roundedRect(posX, posY, badgeW, badgeH, 9, 9, 'F');
        doc.setTextColor(txtColor[0], txtColor[1], txtColor[2]);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(String(text || ''), posX + (badgeW/2), posY + 11.5, { align: 'center' });
      }

      if (data.section === 'body' && data.column.index === 3) {
        const entry = sortedData[data.row.index];
        if (!entry) return; // Safety check
        
        const startX = data.cell.x + 10;
        const startY = data.cell.y + 12;
        const targetW = 135;
        const targetH = 160; 
        const gap = 5;

        const renderPhotoBox = (title: string, offset: number, photoUrl: string | undefined) => {
          // Draw Box Background
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(startX + offset, startY, targetW, targetH, 4, 4, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(startX + offset, startY, targetW, targetH, 4, 4, 'D');

          if (photoUrl) {
            try {
              const actualImg = loadedImages[photoUrl as string];
              if (!actualImg || !actualImg.startsWith('data:image/')) {
                 doc.setFontSize(7);
                 doc.setTextColor(244, 63, 94);
                 doc.text(String('Failed'), (startX + offset) + (targetW/2), startY + (targetH/2), { align: 'center' });
                 return;
              }

              let format = 'JPEG';
              if (actualImg.startsWith('data:image/png')) format = 'PNG';
              else if (actualImg.startsWith('data:image/webp')) format = 'WEBP';
              
              // Calculate Aspect Ratio for "contain" fit
              const props = doc.getImageProperties(actualImg);
              const imgRatio = props.width / props.height;
              const boxRatio = targetW / (targetH - 35); // 35 is for label space at bottom
              
              let drawW = targetW - 4; // 2pt padding
              let drawH = (targetH - 35) - 4;
              
              if (imgRatio > boxRatio) {
                // Image is wider than box
                drawH = drawW / imgRatio;
              } else {
                // Image is taller than box
                drawW = drawH * imgRatio;
              }

              const centerX = (startX + offset) + (targetW / 2) - (drawW / 2);
              const centerY = (startY) + ((targetH - 35) / 2) - (drawH / 2);

              doc.addImage(actualImg, format, centerX, centerY, drawW, drawH, undefined, 'FAST');
            } catch(e) {
              console.error('Error adding PDF image', e);
              doc.setFontSize(7);
              doc.setTextColor(244, 63, 94);
              doc.text(String('Err Format'), (startX + offset) + (targetW/2), startY + (targetH/2), { align: 'center' });
            }
          } else {
            doc.setFontSize(7);
            doc.setTextColor(148, 163, 184);
            doc.text(String('Belum Ada'), (startX + offset) + (targetW/2), startY + ((targetH-35)/2), { align: 'center' });
          }

          // Optimized Label (High Contrast)
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(startX + offset, startY + targetH - 25, targetW, 25, 4, 4, 'F');
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(startX + offset, startY + targetH - 25, targetW, 25, 4, 4, 'D'); 
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 58, 138); 
          doc.text(String(title || ''), startX + offset + (targetW/2), startY + targetH - 9, { align: 'center' });
        };

        const getPhotoTitle = (stage: string) => {
          if (currentProject?.type === 'inlet') {
            if (stage === '0') return 'Foto 0% [Belum]';
            if (stage === '50') return 'Foto 50% [Processing]';
            return 'Foto 100% [Completed]';
          }
          if (currentProject?.type === 'asphalt') {
            if (stage === '0') return 'Condition 0% [Sebelum]';
            if (stage === '50') return 'Condition 50% [Hamparan]';
            return 'Finishing 100% [Padat]';
          }
          if (stage === '0') return 'Condition 0%';
          if (stage === '50') return 'Condition 50%';
          return 'Finishing 100%';
        };

        const photosToRender: {url: string, label: string}[] = [];
        const p0 = entry.photo0 || (Array.isArray(entry.photos0) ? entry.photos0[0] : null);
        const p50 = entry.photo50 || (Array.isArray(entry.photos50) ? entry.photos50[0] : null);
        const p100 = entry.photo100 || (Array.isArray(entry.photos100) ? entry.photos100[0] : null);
        
        if (p0) photosToRender.push({ url: p0, label: getPhotoTitle('0') });
        if (p50) photosToRender.push({ url: p50, label: getPhotoTitle('50') });
        if (p100) photosToRender.push({ url: p100, label: getPhotoTitle('100') });
        
        if (photosToRender.length < 3) {
          const extraPhotos = getEntryPhotos(entry).filter(p => !photosToRender.find(ptr => ptr.url === p));
          for (const ep of extraPhotos) {
            if (photosToRender.length < 3) {
              photosToRender.push({ url: ep, label: 'DOKUMENTASI TAMBAHAN' });
            }
          }
        }

        photosToRender.forEach((item, pIdx) => {
           renderPhotoBox(item.label, pIdx * (targetW + gap), item.url);
        });
      }
    },
    didDrawPage: (data: any) => {
      // Background for footer
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 560, 842, 35, 'F');
      
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dicetak melalui aplikasi Toll-Guard CPM - Dokumen Digital Sah - Hak Cipta Dilindungi`, 40, 582);
      
      const totalPages = doc.getNumberOfPages();
      doc.text(`Halaman ${data.pageNumber} / ${totalPages}`, 802, 582, { align: 'right' });
    }
  });

  // Formal Signature Section on Last Page
  const lastPage = doc.getNumberOfPages();
  doc.setPage(lastPage);
  
  const finalY = (doc as any).lastAutoTable.finalY + 40;
  if (finalY < 500) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    
    doc.text('DISETUJUI OLEH,', 100, finalY);
    doc.text('PENGAWAS LAPANGAN,', 600, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`( ${signature?.name || '.................................'} )`, 100, finalY + 60);
    doc.text('( ................................. )', 600, finalY + 60);
    
    if (signature?.role) {
      doc.setFontSize(7);
      doc.text(signature.role.toUpperCase(), 100, finalY + 72);
      doc.text('Verifikasi Sistem Digital', 600, finalY + 72);
    } else {
      doc.setFontSize(7);
      doc.text('Signature & Cap Basah', 100, finalY + 72);
      doc.text('Verifikasi Sistem Digital', 600, finalY + 72);
    }
  }

  const fileName = `Report_${currentProject?.name?.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
  
  try {
    doc.save(fileName);
  } catch (err) {
    console.warn('doc.save failed, trying blob/file-saver:', err);
    try {
      const blob = doc.output('blob');
      saveAs(blob, fileName);
    } catch (saveErr: any) {
      throw new Error("Failed menyimpan PDF: " + saveErr.message);
    }
  }
};

export const exportCombinedPDF = async (currentProject: any, groups: { date: string, entries: any[] }[], signature?: { name: string, role: string }) => {
  try {
    createOverlay();

    setTimeout(async () => {
      try {
        const jspdfModule = await import('jspdf');
        const jsPDF = (jspdfModule as any).jsPDF || (jspdfModule as any).default.jsPDF;
        
        const autoTableModule = await import('jspdf-autotable');
        let autoTable = (autoTableModule as any).default || autoTableModule;
        if (autoTable.default) autoTable = autoTable.default;

        const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4', compress: true });
        const timestamp = new Date().getTime();

        const loadedImages: Record<string, string> = {};
        const urlsToLoad = new Set<string>();
        
        const getEntryPhotos = (entry: any): string[] => {
          if (!entry) return [];
          const photos = new Set<string>();
          
          if (entry.photo0) photos.add(entry.photo0);
          if (entry.photo50) photos.add(entry.photo50);
          if (entry.photo100) photos.add(entry.photo100);

          const specificKeys = ['photos0', 'photos50', 'photos100', 'images', 'documentation', 'photos'];
          specificKeys.forEach(k => {
            const val = entry[k];
            if (Array.isArray(val)) val.forEach(v => { if (typeof v === 'string' && v.length > 10) photos.add(v); });
          });
          Object.keys(entry).forEach(k => {
            const val = entry[k];
            if (typeof val === 'string' && val.length > 10 && (val.startsWith('http') || val.startsWith('data:image'))) photos.add(val);
            else if (Array.isArray(val)) val.forEach(v => { if (typeof v === 'string' && v.length > 10 && (v.startsWith('http') || v.startsWith('data:image'))) photos.add(v); });
          });
          return Array.from(photos);
        };

        groups.forEach(g => {
          g.entries.forEach(e => {
            getEntryPhotos(e).forEach(url => urlsToLoad.add(url));
          });
        });
        const urlArray = Array.from(urlsToLoad);
        
        updateProgress(`Memulai unduhan foto (0/${urlArray.length})...`, 5);
        // Maksimal concurrency untuk ekspor gabungan dikembalikan ke 6
        const CONCURRENCY = 15;
        let downloadedCount = 0;
        let activeIndex = 0;
        
        const worker = async () => {
          while (activeIndex < urlArray.length) {
            const idx = activeIndex++;
            const url = urlArray[idx];
            const b64 = await preloadImageAsBase64(url);
            if (b64) loadedImages[url] = b64;
            downloadedCount++;
            const progressValue = 5 + Math.round((downloadedCount / urlArray.length) * 90);
            updateProgress(`Mengunduh foto ${downloadedCount}/${urlArray.length}...`, progressValue);
          }
        };

        const workers = [];
        for (let w = 0; w < CONCURRENCY; w++) {
          workers.push(worker());
        }
        await Promise.all(workers);
        
        updateProgress('Menyusun halaman PDF Gabungan...', 95);
        
        groups.forEach((group, groupIdx) => {
          if (groupIdx > 0) doc.addPage();
          
          const activeEntries = group.entries.filter(e => !e.isArchived);
          const totalEntries = activeEntries.length;
          const completedCount = activeEntries.filter(e => e.status === 'completed').length;
          
          const realizedTotal = group.entries.reduce((sum, e) => {
            if (currentProject?.type === 'asphalt') return sum + (Number(e.tonase) || 0);
            return sum + (Number(e.qty) || 0);
          }, 0);
          const unit = currentProject?.type === 'asphalt' ? 'TONASE (T)' : currentProject?.type === 'painting' ? 'LUAS (M2)' : 'PCS/QTY';

          // Header
          doc.setFillColor(15, 23, 42);
          doc.rect(0, 0, 842, 65, 'F');
          
          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.text(String(`LAPORAN HARIAN: ${group.date}`), 40, 42);
          
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(148, 163, 184);
          doc.text(String(`PROYEK: ${currentProject?.name?.toUpperCase() || '-'} | TOLL-GUARD CPM`), 40, 54);
          doc.text(String(`HALAMAN: ${groupIdx + 1} / ${groups.length}`), 802, 42, { align: 'right' });

          // Summary Box
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(40, 80, 762, 40, 4, 4, 'F');
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(`RINGKASAN HARIAN (${group.date}):`, 55, 105);
          
          doc.setFontSize(9);
          doc.setTextColor(30, 58, 138);
          doc.text(`REALISASI: ${realizedTotal.toLocaleString('id-ID')} ${unit}`, 250, 105);
          doc.text(`TOTAL ITEM: ${totalEntries} TITIK`, 500, 105);
          doc.text(`STATUS: ${completedCount}/${totalEntries} SELESAI`, 700, 105);

          let head = [['No.', 'KM / STA', 'Detail Pekerjaan', 'Visual Documentation']];
          const sortedEntries = [...group.entries];
          
          const bodyData = sortedEntries.map((entry, index) => {
            let col1 = `KM: ${entry.km || '-'}\nLOKASI:\nLat: ${entry.latitude ? Number(entry.latitude).toFixed(6) : '-'}\nLon: ${entry.longitude ? Number(entry.longitude).toFixed(6) : '-'}`;
            let col2 = '';
            if (currentProject?.type === 'asphalt') {
               col2 = `LAJUR: ${entry.lajur || '-'}\nDIMENSI: ${entry.panjang || 0}m x ${entry.lebar || 0}m\nPAKAI: ${entry.materialType || '-'}\nTONASE: ${entry.tonase ? Number(entry.tonase).toFixed(3) : 0} T`;
            } else {
               const itemType = entry.signType || entry.plantType || (entry.type ? entry.type.toUpperCase() : '-');
               col2 = `ITEM: ${itemType}\nQTY: ${entry.qty || 0} ${unit}\nNOTE: ${entry.description || '-'}`;
            }
            return [String(index + 1), col1, col2, ''];
          });

          autoTable(doc, {
            startY: 135,
            head: head,
            body: bodyData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], fontSize: 8, halign: 'center' },
            styles: { fontSize: 7, valign: 'middle' },
            columnStyles: {
              0: { cellWidth: 30, halign: 'center' },
              1: { cellWidth: 90 },
              2: { cellWidth: 150 },
              3: { cellWidth: 492, minCellHeight: 120 }
            },
            didDrawCell: (data: any) => {
              if (data.section === 'body' && data.column.index === 3) {
                const entry = sortedEntries[data.row.index];
                if (!entry) return;
                const photosToRender: {url: string, label: string}[] = [];
                const p0 = entry.photo0 || (Array.isArray(entry.photos0) ? entry.photos0[0] : null);
                const p50 = entry.photo50 || (Array.isArray(entry.photos50) ? entry.photos50[0] : null);
                const p100 = entry.photo100 || (Array.isArray(entry.photos100) ? entry.photos100[0] : null);
                
                if (p0) photosToRender.push({ url: p0, label: 'KONDISI 0%' });
                if (p50) photosToRender.push({ url: p50, label: 'KONDISI 50%' });
                if (p100) photosToRender.push({ url: p100, label: 'FINISHING 100%' });
                
                if (photosToRender.length < 3) {
                  const extraPhotos = getEntryPhotos(entry).filter(p => !photosToRender.find(ptr => ptr.url === p));
                  for (const ep of extraPhotos) {
                    if (photosToRender.length < 3) {
                      photosToRender.push({ url: ep, label: 'DOKUMENTASI' });
                    }
                  }
                }

                const imgW = 150;
                const imgH = 100;
                const gap = 10;

                photosToRender.forEach((item, pIdx) => {
                  if (item.url) {
                    try {
                      const actualImg = loadedImages[item.url];
                      if (!actualImg || !actualImg.startsWith('data:image/')) {
                         doc.setFontSize(6);
                         doc.setTextColor(244, 63, 94);
                         doc.text('Failed', data.cell.x + 5 + (pIdx * (imgW + gap)) + (imgW/2) - 10, data.cell.y + 5 + (imgH/2));
                         return;
                      }

                      let format = 'JPEG';
                      if (actualImg.startsWith('data:image/png')) format = 'PNG';
                      else if (actualImg.startsWith('data:image/webp')) format = 'WEBP';
                      
                      doc.addImage(actualImg, format, data.cell.x + 5 + (pIdx * (imgW + gap)), data.cell.y + 5, imgW, imgH, undefined, 'FAST');
                      doc.setFontSize(6);
                      doc.setTextColor(15, 23, 42);
                      doc.text(item.label, data.cell.x + 5 + (pIdx * (imgW + gap)) + 5, data.cell.y + imgH + 12);
                    } catch(e) {
                      console.error('Error adding PDF image', e);
                    }
                  }
                });

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                const statusColor = entry.status === 'completed' ? [5, 150, 105] : [225, 29, 72];
                doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
                doc.text(`STATUS: ${entry.status.toUpperCase()}`, data.cell.x + 5, data.cell.y + 115);
              }
            }
          });

          // Footer per page
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.text(`Toll-Guard CPM | Summary Dayan ${group.date}`, 40, 585);

          // Add Signature on every page or just last? User said "akhir setiap laporan"
          // For combined PDF, probably mean last page or footer. 
          // Let's add it at the bottom of each page if space allows, or last.
          // The prompt says "di akhir setiap laporan excel/pdf".
          // In combined PDF, maybe at the end of each date section.
          
          const pageFinalY = (doc as any).lastAutoTable.finalY + 30;
          if (pageFinalY < 500) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('DISETUJUI OLEH,', 40, pageFinalY);
            doc.setFont('helvetica', 'normal');
            doc.text(`( ${signature?.name || '....................'} )`, 40, pageFinalY + 35);
            if (signature?.role) {
              doc.setFontSize(6);
              doc.text(signature.role.toUpperCase(), 40, pageFinalY + 45);
            }
          }
        });

        doc.save(`Summary_Report_Gabungan_${currentProject?.name}_${timestamp}.pdf`);
        removeOverlay('PDF Gabungan Success');
      } catch (err) {
        removeOverlay();
        console.error(err);
      }
    }, 500);
  } catch (err) {
    removeOverlay();
    console.error(err);
  }
};

export const exportToPDF = (project: any, data: any[], signature?: { name: string, role: string }, allEntries?: any[]) => {
  try {
    console.log('Starting PDF Export...', { project, dataCount: data.length });
    if (!project) {
      alert('Failed: Data proyek tidak ditemukan.');
      return;
    }
    if (!data || data.length === 0) {
      alert('Warning: Tidak ada data pengerjaan untuk diekspor.');
    }
    
    createOverlay();

    // Small delay to allow overlay to render
    setTimeout(async () => {
      try {
        await exportPDF(project, data, signature, allEntries, (msg, val) => {
           updateProgress(msg, val);
        });
        removeOverlay('PDF Success Diunduh');
      } catch (innerErr) {
        removeOverlay();
        console.error(innerErr);
        alert('Failed mendownload PDF.');
      }
    }, 500);
    
  } catch (err: any) {
    removeOverlay();
    console.error('PDF Export Fatal Error:', err);
    alert(`Failed mendownload PDF: ${err.message || 'Terjadi kesalahan sistem'}.`);
  }
};

