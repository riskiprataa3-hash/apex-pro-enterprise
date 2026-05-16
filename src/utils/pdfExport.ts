import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { auth, storage } from '../firebase';
import { ref, getDownloadURL, getBytes } from 'firebase/storage';
import { Project } from '../context/AppContext';

export const preloadImageAsBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;

  // Add global timeout of 35s per image
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 35000));

  // Helper to retry promises
  const retry = async <T>(fn: () => Promise<T>, retries: number = 2): Promise<T> => {
    let lastErr: any;
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fn();
            if (res) return res;
        } catch (e) {
            lastErr = e;
            await new Promise(r => setTimeout(r, 1500 * (i + 1))); // backoff
        }
    }
    return null as any;
  };

  const runLogic = async (): Promise<string | null> => {
    // Helper to extract path from Firebase Storage URL
    const getPathFromUrl = (u: string) => {
      if (u.startsWith('gs://')) {
        let path = u.replace('gs://', '');
        const parts = path.split('/');
        parts.shift();
        try { return decodeURIComponent(parts.join('/')); } catch(e) { return parts.join('/'); }
      }
      if (u.startsWith('https://firebasestorage.googleapis.com/')) {
        const match = u.match(/\/o\/([^?]+)/);
        if (match) {
          let p = match[1];
          if (p.includes('?')) p = p.split('?')[0];
          try { return decodeURIComponent(p); } catch(e) { return p; }
        }
      }
      return null;
    };

    const fbPath = getPathFromUrl(url);

    const toB64 = (blob: Blob): Promise<string> => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
    });

    const resizeImageBlob = async (blob: Blob): Promise<string | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        const objUrl = URL.createObjectURL(blob);
        img.onload = () => {
          URL.revokeObjectURL(objUrl);
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 640; 
          const MAX_HEIGHT = 480; 
          
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (ctx) {
             ctx.fillStyle = "#FFFFFF";
             ctx.fillRect(0, 0, canvas.width, canvas.height);
             ctx.drawImage(img, 0, 0, width, height);
          }
          
          try {
             resolve(canvas.toDataURL("image/jpeg", 0.6));
          } catch(e) {
             resolve(null);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(objUrl);
          resolve(null);
        };
        img.src = objUrl;
      });
    };

    const fetchWithTimeout = async (proxyUrl: string, ms: number = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(id);
            if (response.ok) {
                const blob = await response.blob();
                const b64 = await toB64(blob);
                if (b64 && b64.startsWith('data:image/')) return b64;
            }
        } catch (e) { clearTimeout(id); }
        throw new Error('Proxy fetch failed');
    };

    const tryProxy = async (proxyUrl: string) => retry(() => fetchWithTimeout(proxyUrl), 1);

    // 1. First attempt: WSRV.nl (server-side resize, very fast, very small payload)
    let b64 = await tryProxy("https://wsrv.nl/?url=" + encodeURIComponent(url) + "&w=640&h=480&fit=inside&output=jpg&q=60");
    if (b64) return b64;

    // 2. Second attempt: Direct Canvas fetching (only works if bucket has CORS open)
    const canvasB64 = await retry(async () => {
      return new Promise<string | null>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > 640) { height = Math.round((height * 640) / width); width = 640; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
          }
          try { resolve(canvas.toDataURL("image/jpeg", 0.6)); } catch(e) { reject(e); }
        };
        img.onerror = (e) => reject(e);
        img.src = url;
      });
    }, 0);
    if (canvasB64) return canvasB64;
    
    // 3. Third attempt: Native Firebase SDK (will download full 6MB, could fail with CORS too)
    if (fbPath) {
      const res = await retry(async () => {
         const bytes = await getBytes(ref(storage, fbPath));
         const blob = new Blob([bytes]);
         const resized = await resizeImageBlob(blob);
         return resized;
      }, 0);
      if (res) return res;
    }

    // 4. Fourth attempt: Alternative Proxy
    b64 = await tryProxy("https://corsproxy.io/?" + encodeURIComponent(url));
    if (b64) return b64;

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
  const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4', compress: true });
  const timestamp = new Date().getTime();
  
  // Summary Box & Stats Calculation
  const activeEntries = dataToExport.filter(e => !e.isArchived);
  const totalEntries = activeEntries.length;
  const completedCount = activeEntries.filter(e => e.status === 'completed').length;

  const loadedImages: Record<string, string> = {};
  const urlsToLoad = new Set<string>();
  activeEntries.forEach(e => {
    if (e.photos0?.[0]) urlsToLoad.add(e.photos0[0]);
    if (e.photos50?.[0]) urlsToLoad.add(e.photos50[0]);
    if (e.photos100?.[0]) urlsToLoad.add(e.photos100[0]);
  });
  const urlArray = Array.from(urlsToLoad);
  
  if (onProgress) onProgress(`Memulai unduhan foto (0/${urlArray.length})...`, 5);
  // Proses download secara paralel dengan queue worker agar lebih cepat & progress smooth
  const CONCURRENCY = 5;
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
  
  const realizedQty = sourceEntriesForStats.reduce((sum, e) => {
    if (currentProject?.type === 'asphalt') return sum + (Number(e.tonase) || 0);
    return sum + (Number(e.qty) || 0);
  }, 0);
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
  doc.text(String(`TOLL-GUARD APEX PRO | DOKUMEN RESMI REALISASI LAPORAN`), 40, 54);
  doc.text(String(`WAKTU CETAK: ${new Date().toLocaleString('id-ID')}`), 802, 42, { align: 'right' });

  // Project Info Area
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(String(`PROYEK: ${currentProject?.name?.toUpperCase() || '-'}`), 40, 90);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(String(`Lokasi Strategis: Jalan Tol Trans Sumatera / Regional SUMBAGTENG`), 40, 105);
  doc.text(String(`Tanggal Laporan: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`), 40, 118);

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

  // Realisasi
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); 
  doc.text(String(realizedQty.toLocaleString('id-ID') || '0'), 40 + boxWidth + (boxWidth/2), summaryY, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(String(`REALISASI (${realizationProgress}%)`), 40 + boxWidth + (boxWidth/2), labelY, { align: 'center' });

  // Sisa
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
    head = [['No.', 'KM / Lajur', 'Detail Aspal', 'Detail Progres & Dokumentasi', 'Status']];
  } else if (currentProject?.type === 'traffic-sign') {
    head = [['No.', 'KM / STA', 'Tipe Rambu', 'Detail Progres & Dokumentasi', 'Status']];
  } else if (currentProject?.type === 'painting') {
    head = [['No.', 'Range KM', 'Objek & Luas', 'Detail Progres & Dokumentasi', 'Status']];
  } else if (currentProject?.type === 'planting') {
    head = [['No.', 'KM / STA', 'Tanaman', 'Detail Progres & Dokumentasi', 'Status']];
  } else if (currentProject?.type === 'inlet') {
    head = [['No.', 'KM / STA', 'Ukuran Inlet', 'Detail Progres & Dokumentasi', 'Status']];
  }

  const sortedData = [...dataToExport].sort((a, b) => a.timestamp - b.timestamp);

  const bodyData = sortedData.map((entry, index) => {
    if (!entry) return [String(index + 1), '-', '-', '', 'PENDING'];
    
    let col1 = `KM: ${entry.km || '-'}\nLOKASI:\nLat: ${entry.latitude?.toFixed(6) || '-'}\nLon: ${entry.longitude?.toFixed(6) || '-'}`;
    let col2 = '';
    
    if (currentProject?.type === 'asphalt') {
       col2 = `LAJUR: ${entry.lajur || '-'}\nDIMENSI: ${entry.panjang || 0}m x ${entry.lebar || 0}m\nTEBAL: ${entry.tebal || 0} cm\nMATERIAL: ${entry.materialType || '-'}\nVOLUME: ${entry.volume?.toFixed(3) || 0} m³\nTONASE: ${entry.tonase?.toFixed(3) || 0} T`;
    } else if (currentProject?.type === 'traffic-sign') {
       col2 = `TIPE: ${entry.signType || '-'}\nJUMLAH: ${entry.qty || 0} Unit\nSPESIFIKASI: Standar Toll`;
    } else if (currentProject?.type === 'painting') {
       col1 = `LOKASI:\n${entry.km || '-'} s/d ${entry.kmTo || '-'}\nKOORDINAT:\n${entry.latitude?.toFixed(6)}, ${entry.longitude?.toFixed(6)}`;
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
    didDrawCell: (data) => {
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

        const renderPhotoBox = (title, offset, photoUrl) => {
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
                 doc.text(String('Gagal'), (startX + offset) + (targetW/2), startY + (targetH/2), { align: 'center' });
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

        const getPhotoTitle = (stage) => {
          if (currentProject?.type === 'inlet') {
            if (stage === '0') return 'Foto 0% [Belum]';
            if (stage === '50') return 'Foto 50% [Proses]';
            return 'Foto 100% [Selesai]';
          }
          if (currentProject?.type === 'asphalt') {
            if (stage === '0') return 'Kondisi 0% [Sebelum]';
            if (stage === '50') return 'Kondisi 50% [Hamparan]';
            return 'Finishing 100% [Padat]';
          }
          if (stage === '0') return 'Kondisi 0%';
          if (stage === '50') return 'Kondisi 50%';
          return 'Finishing 100%';
        };

        renderPhotoBox(getPhotoTitle('0'), 0, entry.photos0?.[0]);
        renderPhotoBox(getPhotoTitle('50'), targetW + gap, entry.photos50?.[0]);
        renderPhotoBox(getPhotoTitle('100'), (targetW + gap) * 2, entry.photos100?.[0]);
      }
    },
    didDrawPage: (data) => {
      // Background for footer
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 560, 842, 35, 'F');
      
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Dicetak melalui aplikasi Toll-Guard Apex pro - Dokumen Digital Sah - Hak Cipta Dilindungi`, 40, 582);
      
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
      doc.text('Tanda Tangan & Cap Basah', 100, finalY + 72);
      doc.text('Verifikasi Sistem Digital', 600, finalY + 72);
    }
  }

  const fileName = `Laporan_${currentProject?.name?.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
  
  try {
    // Try standard save first
    doc.save(fileName);
  } catch (err) {
    console.warn('Standard doc.save failed, trying blob/file-saver fallback:', err);
    try {
      const blob = doc.output('blob');
      saveAs(blob, fileName);
    } catch (fallbackErr) {
      console.error('All PDF download methods failed:', fallbackErr);
      alert('Gagal mendownload PDF. Coba gunakan browser lain atau kurangi jumlah data.');
    }
  }
};

export const exportCombinedPDF = async (currentProject: any, groups: { date: string, entries: any[] }[], signature?: { name: string, role: string }) => {
  try {
    createOverlay();

    setTimeout(async () => {
      try {
        const doc = new jsPDF({ orientation: 'l', unit: 'pt', format: 'a4', compress: true });
        const timestamp = new Date().getTime();

        const loadedImages: Record<string, string> = {};
        const urlsToLoad = new Set<string>();
        groups.forEach(g => {
          g.entries.forEach(e => {
            if (e.photos0?.[0]) urlsToLoad.add(e.photos0[0]);
            if (e.photos50?.[0]) urlsToLoad.add(e.photos50[0]);
            if (e.photos100?.[0]) urlsToLoad.add(e.photos100[0]);
          });
        });
        const urlArray = Array.from(urlsToLoad);
        
        updateProgress(`Memulai unduhan foto (0/${urlArray.length})...`, 5);
        // Proses download secara paralel dengan queue worker agar lebih cepat & progress smooth
        const CONCURRENCY = 5;
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
          doc.text(String(`PROYEK: ${currentProject?.name?.toUpperCase() || '-'} | TOLL-GUARD APEX PRO`), 40, 54);
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

          let head = [['No.', 'KM / STA', 'Detail Pekerjaan', 'Dokumentasi Visual']];
          const sortedEntries = [...group.entries].sort((a, b) => a.timestamp - b.timestamp);
          
          const bodyData = sortedEntries.map((entry, index) => {
            let col1 = `KM: ${entry.km || '-'}\nLOKASI:\nLat: ${entry.latitude?.toFixed(6) || '-'}\nLon: ${entry.longitude?.toFixed(6) || '-'}`;
            let col2 = '';
            if (currentProject?.type === 'asphalt') {
               col2 = `LAJUR: ${entry.lajur || '-'}\nDIMENSI: ${entry.panjang || 0}m x ${entry.lebar || 0}m\nPAKAI: ${entry.materialType || '-'}\nTONASE: ${entry.tonase?.toFixed(3) || 0} T`;
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
            didDrawCell: (data) => {
              if (data.section === 'body' && data.column.index === 3) {
                const entry = sortedEntries[data.row.index];
                if (!entry) return;
                const photos = [entry.photos0?.[0], entry.photos50?.[0], entry.photos100?.[0]].filter(Boolean);
                
                const imgW = 150;
                const imgH = 100;
                const gap = 10;

                photos.forEach((img, pIdx) => {
                  if (img) {
                    try {
                      const actualImg = loadedImages[img as string];
                      if (!actualImg || !actualImg.startsWith('data:image/')) {
                         doc.setFontSize(6);
                         doc.setTextColor(244, 63, 94);
                         doc.text('Gagal', data.cell.x + 5 + (pIdx * (imgW + gap)) + (imgW/2) - 10, data.cell.y + 5 + (imgH/2));
                         return;
                      }

                      let format = 'JPEG';
                      if (actualImg.startsWith('data:image/png')) format = 'PNG';
                      else if (actualImg.startsWith('data:image/webp')) format = 'WEBP';
                      
                      doc.addImage(actualImg, format, data.cell.x + 5 + (pIdx * (imgW + gap)), data.cell.y + 5, imgW, imgH);
                      doc.setFontSize(6);
                      doc.setTextColor(15, 23, 42);
                      const label = pIdx === 0 ? 'KONDISI 0%' : pIdx === 1 ? 'KONDISI 50%' : 'KONDISI 100%';
                      doc.text(label, data.cell.x + 5 + (pIdx * (imgW + gap)) + 5, data.cell.y + imgH + 12);
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
          doc.text(`Toll-Guard Apex Pro | Summary Harian ${group.date}`, 40, 585);

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

        doc.save(`Summary_Laporan_Gabungan_${currentProject?.name}_${timestamp}.pdf`);
        removeOverlay('PDF Gabungan Berhasil');
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
      alert('Gagal: Data proyek tidak ditemukan.');
      return;
    }
    if (!data || data.length === 0) {
      alert('Peringatan: Tidak ada data pengerjaan untuk diekspor.');
    }
    
    createOverlay();

    // Small delay to allow overlay to render
    setTimeout(async () => {
      try {
        await exportPDF(project, data, signature, allEntries, (msg, val) => {
           updateProgress(msg, val);
        });
        removeOverlay('PDF Berhasil Diunduh');
      } catch (innerErr) {
        removeOverlay();
        console.error(innerErr);
        alert('Gagal mendownload PDF.');
      }
    }, 500);
    
  } catch (err: any) {
    removeOverlay();
    console.error('PDF Export Fatal Error:', err);
    alert(`Gagal mendownload PDF: ${err.message || 'Terjadi kesalahan sistem'}.`);
  }
};

