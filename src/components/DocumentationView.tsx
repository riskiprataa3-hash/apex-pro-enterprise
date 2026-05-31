import React from 'react';
import { Card } from './ui/Base';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Info,
  FileText,
  Camera,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-primary/20 shadow-xl shadow-primary/10 mb-6">
          <BookOpen className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Pusat Bantuan & Dokumentasi</h1>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Panduan Operasional Sistem CPM (Core Pavement Management)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* PWA Installation */}
        <Card className="p-8 rounded-[2.5rem] border-border/50 bg-card/50 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Smartphone className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <Smartphone className="text-blue-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-black italic uppercase">Instalasi Aplikasi</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic uppercase font-bold">Langkah-langkah menjadikan web sebagai aplikasi HP:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center text-[8px] font-black shrink-0">1</div>
                <p className="text-[10px] uppercase font-black">Buka aplikasi di Chrome atau Safari</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center text-[8px] font-black shrink-0">2</div>
                <p className="text-[10px] uppercase font-black">Klik menu 'Titik 3' (Android) atau 'Share' (iOS)</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-blue-500 text-white flex items-center justify-center text-[8px] font-black shrink-0">3</div>
                <p className="text-[10px] uppercase font-black">Pilih 'Tambah ke Layar Utama' / 'Instal'</p>
              </li>
            </ul>
          </div>
        </Card>

        {/* Reporting Guide */}
        <Card className="p-8 rounded-[2.5rem] border-border/50 bg-card/50 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <Camera className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-2xl">
                <Camera className="text-emerald-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-black italic uppercase">Laporan Lapangan</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic uppercase font-bold">Standar pengambilan data dokumentasi:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[10px] uppercase font-black">Pastikan GPS aktif sebelum input (wajib koordinat)</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[10px] uppercase font-black">Gunakan foto asli (kamera) bukan screenshot</p>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[10px] uppercase font-black">Input data segera setelah pekerjaan selesai di titik Sta</p>
              </li>
            </ul>
          </div>
        </Card>

        {/* Excel Export Help */}
        <Card className="p-8 rounded-[2.5rem] border-border/50 bg-card/50 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-24 h-24" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                <FileSpreadsheet className="text-amber-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-black italic uppercase">Ekspor Laporan</h3>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic uppercase font-bold">Masalah umum pada file Excel:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[10px] uppercase font-black">Foto tidak muncul? Tunggu hingga proses upload 100%</p>
              </li>
              <li className="flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[10px] uppercase font-black">Data dobel? Gunakan fitur 'Arsip' untuk data yang salah</p>
              </li>
              <li className="flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[10px] uppercase font-black">Gunakan 'Mode Lite' jika sinyal di tol sedang buruk</p>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-2">
           <Info className="text-primary w-6 h-6" />
           <h2 className="text-2xl font-black italic uppercase">Butuh Bantuan Lebih Lanjut?</h2>
        </div>
        <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest max-w-2xl mx-auto leading-relaxed">
          Jika Anda menemukan kendala teknis atau kesalahan data yang tidak bisa diperbaiki, segera hubungi Admin IT melalui fitur 'Sapa Admin' di menu Pusat Pesan.
        </p>
        <p className="text-[10px] font-black italic text-primary">PT. SHAKA ANUGERAH KARYA &copy; 2026 - TOLL GUARD ENTERPRISE</p>
      </div>
    </div>
  );
};
