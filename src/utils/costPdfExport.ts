import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateCostPdf = () => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Estimasi Biaya Operasional Aplikasi (Firebase Blaze)', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Asumsi: 1838 titik/hari, 3 foto per titik (Base64), 5 perangkat lapangan, 30 hari.', 14, 30);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 34, 196, 34);

  // Bagian 1: Penggunaan Data (Storage)
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Biaya Penyimpanan Server (Firestore Storage)', 14, 45);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('- Setiap data berisi 3 foto Base64 (~450 KB per dokumen).', 14, 52);
  doc.text('- 1838 data x 450 KB = ~827 MB per hari.', 14, 57);
  doc.text('- 1 Bulan (30 hari) = ~24.8 GB data baru.', 14, 62);
  doc.text('- Harga Firestore: $0.18 / GB (setelah 1GB Free Tier).', 14, 67);
  doc.setTextColor(220, 38, 38);
  doc.text('Estimasi Bulan ke-1: ~ $4.46 (Rp 71.000 / bulan)', 14, 74);
  doc.setTextColor(150, 100, 100);
  doc.text('*Catatan: Biaya akan naik bulan depannya karena data menumpuk (Bln 2: Rp140rb, Bln 3: Rp210rb).', 14, 79);

  // Bagian 2: Bahaya "TANPA LIMIT"
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('2. Dampak "TANPA LIMIT" (Realtime Sync & Bandwidth)', 14, 94);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Jika semua data 24.8 GB ditarik sekaligus oleh 5 perangkat setiap hari (tanpa batasan sistem):', 14, 101);
  
  (doc as any).autoTable({
    startY: 105,
    head: [['Komponen', 'Dengan Sistem Limit (Aman)', 'TANPA LIMIT (Bahaya)']],
    body: [
      ['Network Bandwidth (Egress)', '~150 MB/hari ($0)', '~124 GB/hari -> 3.720 GB/bulan'],
      ['Biaya Bandwidth ($0.11/GB)', 'Gratis', '~$409 (Rp 6.500.000 / bulan)'],
      ['Firestore Reads', 'Aman (di bawah 50K/hari)', 'Extrem (> 275K/hari) - ~$2'],
      ['Kinerja RAM HP Pelaksana', 'Cepat & Ringan', 'Aplikasi Crash hang (Kehabisan Memori)'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const tempY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38);
  doc.text('Total Estimasi JIKA TANPA LIMIT: ~ Rp 6.600.000 / Bulan', 14, tempY);

  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const infoText = "Kesimpulan & Solusi:\n" +
  "Untuk operasional harian yang efisien, membuat aplikasi 'tanpa limit' dalam sistem basis data real-time (onSnapshot) yang memuat gambar kualitas tinggi (Base64) sangat DILARANG. Hal ini bukan hanya menghabiskan biaya bandwidth hingga jutaan rupiah, tetapi perangkat HP biasa tidak akan mampu menampung 24 GB data foto sekaligus dan aplikasi akan otomatis berhenti secara paksa (Crash/Force Close).\n\n" +
  "Sistem telah diatur secara optimal untuk menyimpan data sebanyak apapun yang Anda butuhkan (tidak ada batasan input/penyimpanan), NAMUN dengan cara membatasi TAMPILAN yang ditarik ke HP pelaksana hanya misal 100-500 data terakhir yang aktif, sedangkan data lama aman di cloud dan bisa di Export ke Excel. Dengan begitu biaya Anda per bulan hanya di kisaran Rp 75.000 - Rp 150.000 (hanya bayar storage/hardisk server).";
  
  const splitTitle = doc.splitTextToSize(infoText, 180);
  doc.text(splitTitle, 14, tempY + 10);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Diciptakan otomatis secara cerdas oleh Sistem AI', 14, 280);

  doc.save('Estimasi_Biaya_Operasional.pdf');
};
