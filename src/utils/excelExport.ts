import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { createOverlay, updateProgress, removeOverlay } from './pdfExport';

const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = base64;
  });
};

export const exportDailyExcel = async (currentProject: any, dateDisplay: string, data: any[], signature?: { name: string, role: string }, allEntries?: any[]) => {
  createOverlay();
  updateProgress('Menghasilkan Excel...', 10);

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Laporan ${dateDisplay}`);

    // 1. STYLING & HEADER
    worksheet.mergeCells('A1:I1');
    const headerTitle = worksheet.getCell('A1');
    headerTitle.value = `LAPORAN HARIAN: ${dateDisplay}`;
    headerTitle.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
    headerTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } }; // Slate-900
    headerTitle.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:I2');
    const projectSub = worksheet.getCell('A2');
    projectSub.value = `PROYEK: ${currentProject?.name?.toUpperCase()} | TOLL-GUARD APEX PRO`;
    projectSub.font = { bold: true, size: 10, color: { argb: 'FF475569' } };
    projectSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    projectSub.alignment = { horizontal: 'center', vertical: 'middle' };

    // Summary Row
    const unit = currentProject?.type === 'asphalt' ? 'TON' : currentProject?.type === 'painting' ? 'm2' : 'PCS/QTY';
    
    // Overall Progress Calculation
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

    worksheet.mergeCells('A3:I3');
    const overallCell = worksheet.getCell('A3');
    overallCell.value = `PROGRESS PROYEK (ALL TIME): TARGET = ${targetQty.toLocaleString('id-ID')} | REALISASI = ${overallRealized.toLocaleString('id-ID')} | SISA TARGET = ${remainingQty.toLocaleString('id-ID')} ${unit}`;
    overallCell.font = { bold: true, size: 10, color: { argb: 'FFB91C1C' } }; // Red-700
    overallCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } }; // Red-50
    overallCell.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A4:I4');
    const summaryCell = worksheet.getCell('A4');
    summaryCell.value = `RINGKASAN HARIAN: REALISASI HARI INI = ${realized.toLocaleString('id-ID')} ${unit} | ITEM HARI INI = ${data.length} TITIK`;
    summaryCell.font = { bold: true, size: 10, color: { argb: 'FF1E40AF' } }; // Blue-800
    summaryCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    summaryCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Push starting row for data down by 1
    // Wait, the rest of the file relies on line numbers. Let's see if we can just push it down.

    // 2. DYNAMIC COLUMNS
    let columns: any[] = [{ key: 'no', width: 6 }, { key: 'sta', width: 14 }];
    let headers: string[] = ['NO', 'KM / STA'];

    if (currentProject?.type === 'asphalt') {
      headers.push('LAJUR', 'PJG (m)', 'LBR (m)', 'TBL (cm)', 'VOL (m³)', 'TONASE (t)');
      columns.push(
        { key: 'col1', width: 18 }, { key: 'col2', width: 10 }, { key: 'col3', width: 10 },
        { key: 'col4', width: 10 }, { key: 'col5', width: 12 }, { key: 'col6', width: 12 }
      );
    } else if (currentProject?.type === 'painting') {
      headers.push('OBJEK CAT', 'KM AKHIR', 'LUAS (m²)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 22 }, { key: 'col2', width: 14 }, { key: 'col3', width: 12 }, { key: 'col4', width: 14 }, { key: 'col5', width: 30 }
      );
    } else if (currentProject?.type === 'traffic-sign') {
      headers.push('TIPE RAMBU', 'JUMLAH (UNIT)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 25 }, { key: 'col2', width: 14 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 }
      );
    } else if (currentProject.type === 'inlet') {
      headers.push('UKURAN INLET', 'JUMLAH (UNIT)', 'STATUS', 'DESKRIPSI');
      columns.push(
        { key: 'col1', width: 25 }, { key: 'col2', width: 14 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 }
      );
    } else {
      headers.push('PARAM 1', 'PARAM 2', 'STATUS', 'DESKRIPSI');
      columns.push({ key: 'col1', width: 20 }, { key: 'col2', width: 20 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 });
    }

    headers.push('KOORDINAT GPS', 'DOKUMENTASI');
    columns.push({ key: 'gps', width: 25 }, { key: 'doc', width: 110 }); // Wider for images

    worksheet.getRow(5).values = headers;
    worksheet.columns = columns;

    const headerRow = worksheet.getRow(5);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCC00' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // 3. FILL DATA
    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        const photoSet = [entry.photos0?.[0], entry.photos50?.[0], entry.photos100?.[0]].filter(p => p);
        const hasPhoto = photoSet.length > 0;
        
        const rowData: any = {
            no: i + 1,
            sta: entry.km,
            gps: entry.latitude ? `${entry.latitude.toFixed(6)}, ${entry.longitude?.toFixed(6)}` : '-',
            doc: ''
        };

        if (currentProject?.type === 'asphalt') {
            rowData.col1 = entry.lajur?.toUpperCase();
            rowData.col2 = entry.panjang;
            rowData.col3 = entry.lebar;
            rowData.col4 = entry.tebal;
            rowData.col5 = entry.volume;
            rowData.col6 = entry.tonase;
        } else {
            rowData.col1 = entry.signType || entry.plantType || '-';
            rowData.col2 = entry.qty || 0;
            rowData.col3 = entry.status?.toUpperCase();
            rowData.col4 = entry.description;
        }

        const row = worksheet.addRow(rowData);
        row.height = hasPhoto ? 110 : 25;
        row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        if (hasPhoto) {
            const emuPerPixel = 9525;
            const padding = 5 * emuPerPixel;
            const boxWidthPx = 100;
            const boxHeightPx = 80;

            for (let pIdx = 0; pIdx < photoSet.length; pIdx++) {
                const photoData = photoSet[pIdx];
                if (photoData && photoData.startsWith('data:image')) {
                    try {
                        const base64Data = photoData.split(',')[1];
                        const imageId = workbook.addImage({ base64: base64Data, extension: 'jpeg' });
                        const horizontalOffset = padding + (pIdx * (boxWidthPx * emuPerPixel + padding));

                        worksheet.addImage(imageId, {
                            tl: { col: columns.length - 1, row: row.number - 1, nativeColOff: horizontalOffset, nativeRowOff: padding },
                            ext: { width: boxWidthPx * emuPerPixel, height: boxHeightPx * emuPerPixel },
                            editAs: 'oneCell'
                        });
                    } catch(e) {}
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
    saveAs(new Blob([buffer]), `Laporan_Harian_${currentProject.name}_${dateDisplay}.xlsx`);
    removeOverlay('Excel Selesai');
  } catch (err) {
    removeOverlay();
    console.error(err);
  }
};

export const exportCombinedDailyExcel = async (currentProject: any, groups: { date: string, entries: any[] }[], signature?: { name: string, role: string }) => {
  createOverlay();
  updateProgress('Menyiapkan Excel Gabungan...', 10);

  try {
    const workbook = new ExcelJS.Workbook();
    const timestamp = new Date().getTime();

    for (const group of groups) {
      const safeSheetName = group.date.replace(/[/\\?*[\]]/g, '-');
      const worksheet = workbook.addWorksheet(safeSheetName);
      
      // Header
      worksheet.mergeCells('A1:I1');
      const headerTitle = worksheet.getCell('A1');
      headerTitle.value = `LAPORAN HARIAN: ${group.date}`;
      headerTitle.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
      headerTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      headerTitle.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells('A2:I2');
      const projectSub = worksheet.getCell('A2');
      projectSub.value = `PROYEK: ${currentProject?.name?.toUpperCase()} | SUMMARY HARIAN`;
      projectSub.font = { bold: true, size: 10, color: { argb: 'FF64748B' } };
      projectSub.alignment = { horizontal: 'center', vertical: 'middle' };

      // Columns
      let columns: any[] = [{ key: 'no', width: 6 }, { key: 'sta', width: 14 }];
      let headers: string[] = ['NO', 'KM / STA'];

      if (currentProject?.type === 'asphalt') {
        headers.push('LAJUR', 'PJG (m)', 'LBR (m)', 'TBL (cm)', 'VOL (m³)', 'TONASE (t)');
        columns.push({ key: 'col1', width: 18 }, { key: 'col2', width: 10 }, { key: 'col3', width: 10 }, { key: 'col4', width: 10 }, { key: 'col5', width: 12 }, { key: 'col6', width: 12 });
      } else {
        headers.push('ITEM', 'QTY', 'STATUS', 'DESKRIPSI');
        columns.push({ key: 'col1', width: 25 }, { key: 'col2', width: 12 }, { key: 'col3', width: 14 }, { key: 'col4', width: 30 });
      }
      headers.push('KOORDINAT', 'DOK');
      columns.push({ key: 'gps', width: 25 }, { key: 'doc', width: 110 });
      
      worksheet.getRow(3).values = headers;
      worksheet.columns = columns;
      worksheet.getRow(3).eachCell(c => {
          c.font = { bold: true };
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE047' } };
      });

      // Data
      for (let i = 0; i < group.entries.length; i++) {
          const entry = group.entries[i];
          const photoSet = [entry.photos0?.[0], entry.photos50?.[0], entry.photos100?.[0]].filter(p => p);
          const hasPhoto = photoSet.length > 0;
          
          const rowData: any = {
              no: i + 1,
              sta: entry.km,
              gps: entry.latitude ? `${entry.latitude.toFixed(6)}, ${entry.longitude?.toFixed(6)}` : '-',
              doc: ''
          };
          if (currentProject.type === 'asphalt') {
              rowData.col1 = entry.lajur;
              rowData.col2 = entry.panjang;
              rowData.col3 = entry.lebar;
              rowData.col4 = entry.tebal;
              rowData.col5 = entry.volume;
              rowData.col6 = entry.tonase;
          } else {
              rowData.col1 = entry.signType || entry.plantType || '-';
              rowData.col2 = entry.qty;
              rowData.col3 = entry.status;
              rowData.col4 = entry.description;
          }
          const row = worksheet.addRow(rowData);
          row.height = hasPhoto ? 100 : 20;
          row.eachCell(c => c.alignment = { vertical: 'middle', horizontal: 'center' });

          if (hasPhoto) {
            const emuPerPixel = 9525;
            const padding = 5 * emuPerPixel;
            const boxWidthPx = 100;
            const boxHeightPx = 80;

            for (let pIdx = 0; pIdx < photoSet.length; pIdx++) {
              const photoData = photoSet[pIdx];
              if (photoData && photoData.startsWith('data:image')) {
                try {
                    const base64Data = photoData.split(',')[1];
                    const imageId = workbook.addImage({ base64: base64Data, extension: 'jpeg' });
                    
                    const horizontalOffset = padding + (pIdx * (boxWidthPx * emuPerPixel + padding));

                    worksheet.addImage(imageId, {
                        tl: { col: columns.length - 1, row: row.number - 1, nativeColOff: horizontalOffset, nativeRowOff: padding },
                        ext: { width: boxWidthPx * emuPerPixel, height: boxHeightPx * emuPerPixel },
                        editAs: 'oneCell'
                    });
                } catch(e) {}
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
    removeOverlay('Excel Gabungan Selesai');
  } catch (err) {
    removeOverlay();
    console.error(err);
  }
};
