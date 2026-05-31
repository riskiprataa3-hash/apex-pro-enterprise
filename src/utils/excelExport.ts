/**
 * Utilitas untuk mengekspor data laporan proyek ke format Microsoft Excel (.xlsx).
 * Menggunakan library ExcelJS untuk manipulasi workbook dan File-Saver untuk pengunduhan.
 */
import { saveAs } from 'file-saver';
import { createOverlay, updateProgress, removeOverlay } from './pdfExport';
import { storage } from '../firebase';
import { ref, getBytes } from 'firebase/storage';

/**
 * Mendapatkan dimensi asli gambar dari string base64.
 * @param base64 String data gambar base64.
 * @returns Promise berisi lebar dan tinggi gambar.
 */
const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = base64;
  });
};

// Global cache for images to avoid redundant fetches
const imageCache: Record<string, string> = {};

/**
 * Mengambil gambar dari URL (seperti Firebase Storage) dan mengubahnya menjadi format base64.
 * Menggunakan multiple proxy strategy untuk menghindari kendala CORS dan timeout.
 */
export const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    if (!url) return null;
    if (url.startsWith('data:image')) return url;
    if (imageCache[url]) return imageCache[url];

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
                if (match) { let p = match[1]; try { return decodeURIComponent(p); } catch(e) { return p; } }
            }
            return null;
        };

        const fetchWithTimeout = async (targetUrl: string, ms: number = 20000) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), ms);
            try {
                const response = await fetch(targetUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (response.ok) {
                    const blob = await response.blob();
                    const b64 = await resizeImageBlob(blob);
                    if (b64 && b64.startsWith('data:image/')) {
                        return b64;
                    }
                }
            } catch (e) { clearTimeout(timeoutId); }
            return null;
        };

        const encodedUrl = encodeURIComponent(url);
        const strategies = [
            `https://wsrv.nl/?url=${encodedUrl}&output=jpeg&q=15&w=250`,
            `/api/proxy?url=${encodedUrl}`
        ];

        for (const strategy of strategies) {
            try {
                const result = await fetchWithTimeout(strategy, 8000);
                if (result && result.startsWith('data:image/')) {
                    imageCache[url] = result; 
                    return result;
                }
            } catch (e) { continue; }
        }

        const path = getPathFromUrl(url);
        if (path) {
            try {
                const fileRef = ref(storage, path);
                const bytes = await getBytes(fileRef);
                const blob = new Blob([bytes], { type: 'image/jpeg' });
                const b64 = await resizeImageBlob(blob);
                if (b64 && b64.startsWith('data:image/')) {
                    imageCache[url] = b64;
                    return b64;
                }
            } catch(e) { }
        }

        return null;
    };

    return Promise.race([runLogic(), timeoutPromise]);
};

/**
 * Mengambil foto dari objek entry secara agresif.
 */
export const getEntryPhotos = (entry: any): string[] => {
  if (!entry) return [];
  const photos = new Set<string>();
  
  if (entry.photo0) photos.add(entry.photo0);
  if (entry.photo50) photos.add(entry.photo50);
  if (entry.photo100) photos.add(entry.photo100);

  // Known specific keys first
  const specificKeys = ['photos0', 'photos50', 'photos100', 'images', 'documentation', 'photos'];
  specificKeys.forEach(k => {
    const val = entry[k];
    if (Array.isArray(val)) {
      val.forEach(v => {
        if (typeof v === 'string' && v.length > 10 && (v.startsWith('http') || v.startsWith('data:image'))) {
          photos.add(v);
        }
      });
    }
  });

  // Then scan all keys recursively (one level)
  Object.keys(entry).forEach(k => {
    const val = entry[k];
    if (typeof val === 'string' && val.length > 10 && (val.startsWith('http') || val.startsWith('data:image'))) {
      photos.add(val);
    } else if (Array.isArray(val)) {
      val.forEach(v => {
        if (typeof v === 'string' && v.length > 10 && (v.startsWith('http') || v.startsWith('data:image'))) {
          photos.add(v);
        }
      });
    }
  });
  return Array.from(photos);
};

/**
 * Mengekspor laporan harian tunggal ke file Excel.
 */
export const exportDailyExcel = async (currentProject: any, dateDisplay: string, data: any[], signature?: { name: string, role: string }, allEntries?: any[]) => {
  createOverlay();
  updateProgress('Menghasilkan Excel...', 10);

  try {
    const ExcelJSModule = await import('exceljs');
    let ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;
    if (ExcelJS.default) ExcelJS = ExcelJS.default;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Report ${dateDisplay}`);

    const isAsphalt = String(currentProject?.type).toLowerCase().includes('asphalt') || String(currentProject?.type).toLowerCase().includes('aspal');
    const isPainting = String(currentProject?.type).toLowerCase().includes('painting') || String(currentProject?.type).toLowerCase().includes('pengecatan');

    // DYNAMIC COLUMNS SETUP
    let columns: any[] = [{ key: 'no', width: 6 }, { key: 'sta', width: 14 }];
    let headers: string[] = ['NO', 'KM / STA'];

    if (isAsphalt) {
      headers.push('LAJUR', 'PJG (m)', 'LBR (m)', 'TBL (cm)', 'VOL (m³)', 'TONASE (t)');
      columns.push(
        { key: 'col1', width: 18 }, { key: 'col2', width: 10 }, { key: 'col3', width: 10 },
        { key: 'col4', width: 10 }, { key: 'col5', width: 12 }, { key: 'col6', width: 12 }
      );
    } else if (isPainting) {
      headers.push('OBJEK CAT', 'KM AKHIR', 'LUAS (m²)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 22 }, { key: 'col2', width: 14 }, { key: 'col3', width: 12 }, { key: 'col4', width: 14 }, { key: 'col5', width: 30 }
      );
    } else {
      headers.push('ITEM/TIPE', 'JUMLAH (QTY)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 25 }, { key: 'col2', width: 14 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 }
      );
    }

    headers.push('KOORDINAT GPS', 'DOKUMENTASI');
    columns.push({ key: 'gps', width: 25 }, { key: 'doc', width: 90 }); 

    const lastColLetter = String.fromCharCode(64 + columns.length);
    worksheet.columns = columns;

    // STYLING & HEADER
    worksheet.mergeCells(`A1:${lastColLetter}1`);
    const headerTitle = worksheet.getCell('A1');
    headerTitle.value = `LAPORAN HARIAN: ${dateDisplay}`;
    headerTitle.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
    headerTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    headerTitle.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells(`A2:${lastColLetter}2`);
    const projectSub = worksheet.getCell('A2');
    projectSub.value = `PROYEK: ${currentProject?.name?.toUpperCase()} | TOLL-GUARD CPM`;
    projectSub.font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    projectSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    projectSub.alignment = { horizontal: 'center', vertical: 'middle' };

    const unit = currentProject?.type === 'asphalt' ? 'TON' : currentProject?.type === 'painting' ? 'm2' : 'PCS/QTY';
    const targetQty = currentProject?.targetQty || 0;
    const sourceEntriesForStats = (allEntries && allEntries.length > 0) ? allEntries.filter(e => !e.isArchived) : data.filter(e => !e.isArchived);
    const overallRealized = sourceEntriesForStats.reduce((sum, e) => {
      if (currentProject?.type === 'asphalt') return sum + (Number(e.tonase) || 0);
      return sum + (Number(e.qty) || 0);
    }, 0);
    const remainingQty = Math.max(0, targetQty - overallRealized);

    const realized = data.reduce((sum, e) => {
      if (e.isArchived) return sum;
      if (currentProject?.type === 'asphalt') return sum + (Number(e.tonase) || 0);
      return sum + (Number(e.qty) || 0);
    }, 0);

    worksheet.mergeCells(`A3:${lastColLetter}3`);
    const overallCell = worksheet.getCell('A3');
    overallCell.value = `PROGRESS PROYEK (ALL TIME): TARGET = ${targetQty.toLocaleString('id-ID')} | REALISASI = ${overallRealized.toLocaleString('id-ID')} | SISA TARGET = ${remainingQty.toLocaleString('id-ID')} ${unit}`;
    overallCell.font = { bold: true, size: 10, color: { argb: 'FFB91C1C' } };
    overallCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
    overallCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells(`A4:${lastColLetter}4`);
    const summaryCell = worksheet.getCell('A4');
    summaryCell.value = `RINGKASAN HARIAN: REALISASI HARI INI = ${realized.toLocaleString('id-ID')} ${unit} | ITEM HARI INI = ${data.length} TITIK`;
    summaryCell.font = { bold: true, size: 10, color: { argb: 'FF1E40AF' } };
    summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    summaryCell.alignment = { horizontal: 'center', vertical: 'middle' };

    const headerRow = worksheet.getRow(5);
    headerRow.values = headers;
    headerRow.height = 30;
    headerRow.eachCell((cell: any) => {
      cell.font = { bold: true, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // DATA PRE-PROCESSING
    updateProgress("Sinkronisasi Dokumentasi...", 15);
    
    const allPhotoUrls = new Set<string>();
    data.forEach(entry => {
        getEntryPhotos(entry).forEach(url => allPhotoUrls.add(url));
    });

    updateProgress(`Sinkronisasi ${allPhotoUrls.size} Foto...`, 20);

    const urlArray = Array.from(allPhotoUrls);
    const batchSize = 15; 
    for (let i = 0; i < urlArray.length; i += batchSize) {
        const batch = urlArray.slice(i, i + batchSize);
        updateProgress(`Mengunduh Dokumentasi (${i + 1}/${urlArray.length})...`, 25 + Math.floor((i / urlArray.length) * 55));
        await Promise.all(batch.map(url => fetchImageAsBase64(url)));
        await new Promise(r => setTimeout(r, 100)); // buffer
        }

    // DATA LOOP
    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        updateProgress(`Menyusun Baris ${i + 1}/${data.length}`, 80 + Math.floor((i / data.length) * 15));
        
        const photoSet = getEntryPhotos(entry).slice(0, 4); 
        const hasPhoto = photoSet.length > 0;
        
        const rowData: any = {
            no: i + 1,
            sta: entry.km || entry.sta || entry.KM || '-',
            gps: (entry.latitude && entry.longitude) 
                ? `${Number(entry.latitude).toFixed(6)}, ${Number(entry.longitude).toFixed(6)}` 
                : (entry.gps || entry.coordinate || '-'),
            doc: ''
        };

        if (isAsphalt) {
            rowData.col1 = (entry.lajur || entry.lane || '-').toUpperCase();
            rowData.col2 = entry.panjang || 0;
            rowData.col3 = entry.lebar || 0;
            rowData.col4 = entry.tebal || 0;
            rowData.col5 = entry.volume || 0;
            rowData.col6 = entry.tonase || 0;
        } else if (isPainting) {
            rowData.col1 = (entry.signType || entry.objectName || entry.itemType || entry.brand || '-').toUpperCase();
            rowData.col2 = entry.kmTo || entry.kmEnd || entry.STA_AKHIR || '-';
            rowData.col3 = entry.qty || entry.luas || 0;
            rowData.col4 = (entry.status || entry.entryStatus || entry.result || 'COMPLETED').toUpperCase();
            rowData.col5 = entry.description || entry.entryDesc || entry.remark || '-';
        } else {
            rowData.col1 = (entry.signType || entry.plantType || entry.itemType || entry.itemName || '-').toUpperCase();
            rowData.col2 = entry.qty || entry.amount || 0;
            rowData.col3 = (entry.status || entry.entryStatus || entry.result || 'COMPLETED').toUpperCase();
            rowData.col4 = entry.description || entry.entryDesc || entry.remark || '-';
        }

        const row = worksheet.addRow(rowData);
        row.height = hasPhoto ? 120 : 25; 
        row.eachCell((cell: any) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        if (hasPhoto) {
            const boxWidthPx = 80;
            const boxHeightPx = 80;

            for (let pIdx = 0; pIdx < photoSet.length; pIdx++) {
                const photoUrl = photoSet[pIdx];
                if (!photoUrl) continue;

                try {
                    let photoData = await fetchImageAsBase64(photoUrl);

                    if (photoData && photoData.startsWith('data:image')) {
                        const extension = 'jpeg';
                        const base64Content = photoData.split(',')[1];
                        const imageId = workbook.addImage({ base64: base64Content, extension });

                        worksheet.addImage(imageId, {
                            tl: { col: (columns.length - 1) + (pIdx * 0.25), row: row.number - 1 + 0.1 },
                            ext: { width: boxWidthPx, height: boxHeightPx },
                            editAs: 'oneCell'
                        });
                    }
                } catch(e) {
                    console.error("Image insertion failed:", e);
                }
            }
        }
    }

    // 4. SIGNATURE BLOCK
    const footerStart = worksheet.rowCount + 4;
    const signRow = footerStart;
    
    worksheet.mergeCells(`B${signRow}:C${signRow}`);
    worksheet.getCell(`B${signRow}`).value = 'DISETUJUI OLEH,';
    worksheet.getCell(`B${signRow}`).font = { bold: true };
    worksheet.getCell(`B${signRow}`).alignment = { horizontal: 'center' };

    worksheet.mergeCells(`G${signRow}:H${signRow}`);
    worksheet.getCell(`G${signRow}`).value = 'PENGAWAS LAPANGAN,';
    worksheet.getCell(`G${signRow}`).font = { bold: true };
    worksheet.getCell(`G${signRow}`).alignment = { horizontal: 'center' };

    const signLabelRow = signRow + 4;
    worksheet.mergeCells(`B${signLabelRow}:C${signLabelRow}`);
    worksheet.getCell(`B${signLabelRow}`).value = `( ${signature?.name || '.................................'} )`;
    worksheet.getCell(`B${signLabelRow}`).alignment = { horizontal: 'center' };
    if (signature?.name) worksheet.getCell(`B${signLabelRow}`).font = { bold: true };

    worksheet.mergeCells(`G${signLabelRow}:H${signLabelRow}`);
    worksheet.getCell(`G${signLabelRow}`).value = '( ................................. )';
    worksheet.getCell(`G${signLabelRow}`).alignment = { horizontal: 'center' };

    if (signature?.role) {
      worksheet.getCell(`B${signLabelRow + 1}`).value = signature.role.toUpperCase();
      worksheet.mergeCells(`B${signLabelRow+1}:C${signLabelRow+1}`);
      worksheet.getCell(`B${signLabelRow+1}`).alignment = { horizontal: 'center' };
      worksheet.getCell(`B${signLabelRow+1}`).font = { size: 8, italic: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Report_Dayan_${currentProject.name}_${dateDisplay}.xlsx`);
    removeOverlay('Excel Completed');
  } catch (err) {
    removeOverlay();
    console.error(err);
  }
};

/**
 * Mengekspor kumpulan laporan harian ke dalam satu file Excel dengan beberapa sheet.
 */
export const exportCombinedDailyExcel = async (currentProject: any, groups: { date: string, entries: any[] }[], signature?: { name: string, role: string }) => {
  createOverlay();
  updateProgress('Menyiapkan Excel Gabungan...', 10);

  try {
    const ExcelJSModule = await import('exceljs');
    let ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;
    if (ExcelJS.default) ExcelJS = ExcelJS.default;
    
    const workbook = new ExcelJS.Workbook();
    const timestamp = new Date().getTime();

    // PRE-FETCH: Gather all unique URLs from all groups for parallel fetching
    updateProgress("Sinkronisasi Dokumentasi (Gabungan)...", 15);
    
    const isAsphalt = String(currentProject?.type).toLowerCase().includes('asphalt') || String(currentProject?.type).toLowerCase().includes('aspal');
    const isPainting = String(currentProject?.type).toLowerCase().includes('painting') || String(currentProject?.type).toLowerCase().includes('pengecatan');

    const allPhotoUrls = new Set<string>();
    groups.forEach(group => {
      group.entries.forEach(entry => {
        getEntryPhotos(entry).forEach(url => allPhotoUrls.add(url));
      });
    });

    const urlArray = Array.from(allPhotoUrls);
    const batchSize = 15;
    for (let i = 0; i < urlArray.length; i += batchSize) {
      const batch = urlArray.slice(i, i + batchSize);
      updateProgress(`Sync Foto Gabungan (${i + 1}/${urlArray.length})...`, 20 + Math.floor((i / urlArray.length) * 55));
      await Promise.all(batch.map(url => fetchImageAsBase64(url)));
      await new Promise(r => setTimeout(r, 100)); // buffer
      }

    let sheetCount = 0;
    for (const group of groups) {
      sheetCount++;
      updateProgress(`Menyusun sheet ${sheetCount}/${groups.length}...`, 75 + Math.floor((sheetCount / groups.length) * 20));
      const safeSheetName = group.date.replace(/[/\\?*[\]]/g, '-').substring(0, 31);
      const worksheet = workbook.addWorksheet(safeSheetName);
      
      // Columns
      let columns: any[] = [{ key: 'no', width: 6 }, { key: 'sta', width: 14 }];
      let headers: string[] = ['NO', 'KM / STA'];

      if (isAsphalt) {
        headers.push('LAJUR', 'PJG (m)', 'LBR (m)', 'TBL (cm)', 'VOL (m³)', 'TONASE (t)');
        columns.push({ key: 'col1', width: 18 }, { key: 'col2', width: 10 }, { key: 'col3', width: 10 }, { key: 'col4', width: 10 }, { key: 'col5', width: 12 }, { key: 'col6', width: 12 });
      } else if (isPainting) {
        headers.push('OBJEK CAT', 'KM AKHIR', 'LUAS (m²)', 'STATUS', 'DESKRIPSI');
        columns.push({ key: 'col1', width: 22 }, { key: 'col2', width: 14 }, { key: 'col3', width: 12 }, { key: 'col4', width: 14 }, { key: 'col5', width: 30 });
      } else {
        headers.push('ITEM', 'QTY', 'STATUS', 'DESKRIPSI');
        columns.push({ key: 'col1', width: 25 }, { key: 'col2', width: 12 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 });
      }
      headers.push('KOORDINAT', 'DOK');
      columns.push({ key: 'gps', width: 25 }, { key: 'doc', width: 90 });
      
      const lastColLetter = String.fromCharCode(64 + columns.length);
      worksheet.columns = columns;

      // Header
      worksheet.mergeCells(`A1:${lastColLetter}1`);
      const headerTitle = worksheet.getCell('A1');
      headerTitle.value = `LAPORAN HARIAN: ${group.date}`;
      headerTitle.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
      headerTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      headerTitle.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells(`A2:${lastColLetter}2`);
      const projectSub = worksheet.getCell('A2');
      projectSub.value = `PROYEK: ${currentProject?.name?.toUpperCase()} | SUMMARY HARIAN`;
      projectSub.font = { bold: true, size: 10, color: { argb: 'FF64748B' } };
      projectSub.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.getRow(3).values = headers;
      worksheet.getRow(3).eachCell((c: any) => {
          c.font = { bold: true };
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE047' } };
          c.alignment = { horizontal: 'center', vertical: 'middle' };
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      // Data
      for (let i = 0; i < group.entries.length; i++) {
          const entry = group.entries[i];
          const photoSet = getEntryPhotos(entry).slice(0, 4);
          const hasPhoto = photoSet.length > 0;
          
          const rowData: any = {
              no: i + 1,
              sta: entry.km || entry.sta || entry.KM || '-',
              gps: entry.latitude ? `${Number(entry.latitude).toFixed(6)}, ${Number(entry.longitude || 0).toFixed(6)}` : (entry.gps || entry.coordinate || '-'),
              doc: ''
          };

          if (isAsphalt) {
              rowData.col1 = (entry.lajur || entry.lane || '-').toUpperCase();
              rowData.col2 = entry.panjang || 0;
              rowData.col3 = entry.lebar || 0;
              rowData.col4 = entry.tebal || 0;
              rowData.col5 = entry.volume || 0;
              rowData.col6 = entry.tonase || 0;
          } else if (isPainting) {
              rowData.col1 = (entry.signType || entry.objectName || entry.itemType || entry.brand || '-').toUpperCase();
              rowData.col2 = entry.kmTo || entry.kmEnd || entry.STA_AKHIR || '-';
              rowData.col3 = entry.qty || entry.luas || 0;
              rowData.col4 = (entry.status || entry.entryStatus || entry.result || 'COMPLETED').toUpperCase();
              rowData.col5 = entry.description || entry.entryDesc || entry.remark || '-';
          } else {
              rowData.col1 = (entry.signType || entry.plantType || entry.itemType || entry.itemName || '-').toUpperCase();
              rowData.col2 = entry.qty || entry.amount || 0;
              rowData.col3 = (entry.status || entry.entryStatus || entry.result || 'COMPLETED').toUpperCase();
              rowData.col4 = entry.description || entry.entryDesc || entry.remark || '-';
          }

          const row = worksheet.addRow(rowData);
          row.height = hasPhoto ? 120 : 25;
          row.eachCell((c: any) => {
              c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
              c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          });

          if (hasPhoto) {
            const boxWidthPx = 80;
            const boxHeightPx = 80;

            for (let pIdx = 0; pIdx < photoSet.length; pIdx++) {
              const photoUrl = photoSet[pIdx];
              if (!photoUrl) continue;
              try {
                  let photoData = await fetchImageAsBase64(photoUrl);

                  if (photoData && photoData.startsWith('data:image')) {
                      const extension = 'jpeg';
                      const base64Content = photoData.split(',')[1];
                      const imageId = workbook.addImage({ base64: base64Content, extension });

                      worksheet.addImage(imageId, {
                          tl: { col: (columns.length - 1) + (pIdx * 0.25), row: row.number - 1 + 0.1 },
                          ext: { width: boxWidthPx, height: boxHeightPx },
                          editAs: 'oneCell'
                      });
                  }
              } catch(e) {
                  console.warn("Combined photo insert failed:", e);
              }
            }
          }
      }
      
      const footerStart = worksheet.rowCount + 3;
      worksheet.mergeCells(`B${footerStart}:C${footerStart}`);
      worksheet.getCell(`B${footerStart}`).value = 'DISETUJUI OLEH,';
      worksheet.getCell(`B${footerStart}`).font = { bold: true };
      
      const nameRow = footerStart + 4;
      worksheet.mergeCells(`B${nameRow}:C${nameRow}`);
      worksheet.getCell(`B${nameRow}`).value = `( ${signature?.name || '........................'} )`;
      worksheet.getCell(`B${nameRow}`).alignment = { horizontal: 'center' };
      if (signature?.role) {
        worksheet.getCell(`B${nameRow+1}`).value = signature.role.toUpperCase();
        worksheet.mergeCells(`B${nameRow+1}:C${nameRow+1}`);
        worksheet.getCell(`B${nameRow+1}`).alignment = { horizontal: 'center' };
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Summary_Excel_Daily_${currentProject.name}_${timestamp}.xlsx`);
    removeOverlay('Excel Gabungan Completed');
  } catch (err) {
    removeOverlay();
    console.error(err);
  }
};
