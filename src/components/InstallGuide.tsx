import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, Download, Share2, Globe, Copy, CheckCircle2, ExternalLink, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Base';

export const InstallGuide = () => {
  const { isInstallModalOpen, setIsInstallModalOpen } = useApp();
  const [copied, setCopied] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBottomBar, setShowBottomBar] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show bottom bar if we are not already in standalone mode
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowBottomBar(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If prompt not available, just open the manual guide
      setIsInstallModalOpen(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowBottomBar(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Bottom Floating Install Bar */}
      <AnimatePresence>
        {showBottomBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 z-[999] bg-primary text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border border-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase italic tracking-widest leading-none mb-1">Apex Pro App</span>
                <span className="text-[8px] font-bold opacity-80 uppercase leading-none">Instal versi Native sekarang</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleInstallClick}
                className="h-10 px-6 rounded-xl bg-white text-primary font-black uppercase italic text-[10px] shadow-lg shadow-white/20"
              >
                Instal
              </Button>
              <button 
                onClick={() => setShowBottomBar(false)}
                className="p-2 bg-white/10 rounded-xl text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Install Modal (Manually Triggered) */}
      <AnimatePresence>
        {isInstallModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInstallModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-white/10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="overflow-y-auto w-full custom-scrollbar">
                {/* Header */}
                <div className="p-8 pb-4 text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 rotate-3 border border-primary/20">
                    <Smartphone className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Transformasi Native</h2>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase">Ubah Web Menjadi Aplikasi HP Mandiri</p>
                </div>

                <div className="px-8 pb-8 space-y-6 text-center">
                  {/* Native Benefits */}
                  <div className="grid grid-cols-2 gap-2">
                     <div className="bg-muted/30 p-3 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Tanpa Browser</span>
                     </div>
                     <div className="bg-muted/30 p-3 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                        <Download className="w-4 h-4 text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Akses Offline</span>
                     </div>
                  </div>

                  {/* Installation Options */}
                  <div className="space-y-4">
                    <div className="p-1 bg-muted rounded-2xl flex">
                      <div className="flex-1 p-3 bg-card rounded-xl shadow-sm">
                        <span className="text-[10px] font-black uppercase italic text-primary">Metode 1: Native</span>
                      </div>
                    </div>

                    {deferredPrompt ? (
                      <Button 
                        onClick={handleInstallClick}
                        className="w-full h-16 rounded-[2rem] bg-primary text-white font-black uppercase italic text-sm shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                      >
                        <Zap className="w-6 h-6 fill-current" />
                        INSTAL SEKARANG
                      </Button>
                    ) : (
                      <div className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-primary/20 space-y-4 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]">
                        <div className="flex flex-col items-center gap-4 text-center">
                          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black text-3xl border border-primary/20 shadow-inner">2.0</div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black uppercase italic text-primary underline">CARA MANUAL</h4>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight leading-relaxed">
                              Jika tombol instal tidak muncul otomatis:
                            </p>
                          </div>

                          <div className="w-full bg-muted/50 p-4 rounded-3xl border border-white/5 space-y-3">
                            <div className="flex items-start gap-3">
                               <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                               <p className="text-[9px] font-bold uppercase text-left">Buka menu browser (Titik 3 di kanan atas Chrome)</p>
                            </div>
                            <div className="flex items-start gap-3">
                               <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                               <p className="text-[9px] font-bold uppercase text-left">Cari Pilihan <span className="text-foreground underline">"Instal Aplikasi"</span> atau <span className="text-foreground underline">"Tambahkan ke Layar Utama"</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advanced: Play Store / APK Section */}
                  <div className="p-6 bg-gradient-to-br from-primary/20 to-card rounded-[3rem] border border-primary/30 space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-black uppercase italic text-primary">APK & GOOGLE PLAY</h4>
                    </div>
                    
                    <p className="text-[9px] text-muted-foreground font-bold uppercase leading-relaxed text-center">
                      Gunakan <span className="text-foreground">GitHub</span> Anda untuk membuat <span className="text-foreground">APK</span> karena scanner PWA Builder sering terblokir sistem keamanan.
                    </p>

                    <div className="grid grid-cols-1 gap-2">
                      <Button 
                        onClick={() => window.open('https://www.pwabuilder.com/', '_blank')}
                        className="w-full h-14 rounded-2xl bg-slate-900 border border-slate-700 text-white font-black uppercase italic text-[11px] shadow-2xl flex items-center justify-center gap-3 overflow-hidden group"
                      >
                        <div className="flex flex-col items-start leading-none">
                          <span className="text-[7px] font-bold opacity-60 not-italic">BUILD VIA</span>
                          <span className="text-[12px]">PWA Builder (GitHub)</span>
                        </div>
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                           <Download className="w-4 h-4" />
                        </div>
                      </Button>

                      <div className="bg-muted-foreground/10 p-4 rounded-3xl border border-white/5 space-y-3">
                         <p className="text-[10px] font-black uppercase text-primary italic">Alur Ekspor & Build APK:</p>
                         <ol className="text-[9px] font-bold uppercase text-left space-y-3 opacity-90">
                           <li className="flex gap-2">
                             <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[7px] text-white shrink-0">0</div>
                             <span>Buka <span className="text-foreground underline">Settings (Ikon Gear)</span> &raquo; <span className="text-foreground underline">GitHub</span> &raquo; Klik tombol <span className="text-primary font-black underline">"SIAPKAN DAN TERAPKAN SEMUA PERUBAHAN"</span> (Wajib agar file terkirim).</span>
                           </li>
                           <li className="flex gap-2">
                             <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[7px] text-white shrink-0">1</div>
                             <span>Buka <span className="text-foreground underline">PWABuilder.com</span>.</span>
                           </li>
                           <li className="flex gap-2">
                             <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[7px] text-white shrink-0">2</div>
                             <span>Pilih opsi <span className="text-foreground underline">"Package from GitHub"</span> (Ikon GitHub).</span>
                           </li>
                           <li className="flex gap-2">
                             <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[7px] text-white shrink-0">3</div>
                             <span>Masukkan link Repo GitHub Anda &raquo; Klik <span className="text-foreground underline">Generate APK</span>.</span>
                           </li>
                         </ol>
                      </div>

                      <Button 
                        onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
                        variant="outline"
                        className="w-full h-10 rounded-xl border-primary/20 text-primary font-black uppercase italic text-[9px]"
                      >
                         Panduan Sertifikat Android
                      </Button>
                    </div>
                  </div>

                  {/* Link Options */}
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase text-center text-primary tracking-[0.3em]">Link Download Cepat</p>
                    
                    <div className="bg-muted p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4 overflow-hidden">
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-mono font-bold truncate opacity-60 text-left">{window.location.host}</p>
                      </div>
                      <Button 
                        onClick={handleCopy}
                        size="sm"
                        variant="outline"
                        className="shrink-0 h-10 px-4 rounded-xl border-primary/20 text-primary"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        <span className="text-[9px] font-black uppercase italic">{copied ? 'OK' : 'Copy'}</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                         onClick={() => window.open('whatsapp://send?text=Halo tim Shaka, berikut link download aplikasi Apex Core/Pro: ' + window.location.href)}
                         variant="outline"
                         className="h-14 rounded-2xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 flex flex-col items-center justify-center gap-1"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">WA Download</span>
                      </Button>

                      <Button 
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 flex flex-col items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Link Browser</span>
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => setIsInstallModalOpen(false)}
                    className="w-full h-14 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest border border-white/5"
                  >
                    Tutup Panduan
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

