import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showManualInstruction, setShowManualInstruction] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Show manual instruction if native prompt is not available
      setShowManualInstruction(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Don't show if already installed (standalone mode)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-24 right-4 z-50">
        <button
          onClick={handleInstallClick}
          className="flex items-center space-x-2 bg-[#1A1A1A]/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-white/10 hover:bg-black hover:border-white/20 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="bg-[#00E5FF]/10 p-1.5 rounded-full mr-1">
             <Download className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <span className="font-bold text-sm tracking-wide">Install App</span>
        </button>
      </div>

      <AnimatePresence>
        {showManualInstruction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowManualInstruction(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#121212] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowManualInstruction(false)}
                className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex justify-center mb-6 mt-2">
                <div className="bg-[#00E5FF]/10 p-4 rounded-full">
                  <Download className="w-10 h-10 text-[#00E5FF]" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white text-center mb-2">Cara Install Aplikasi</h3>
              
              <p className="text-sm text-gray-400 text-center mb-6">
                Untuk performa maksimal dan akses fullscreen, install aplikasi ke layar beranda perangkat Anda:
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="bg-black/50 p-2 rounded-lg">
                    <Share className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">1. Buka Menu Browser</h4>
                    <p className="text-xs text-gray-500 mt-1">Tap icon titik tiga (Chrome) atau Share (Safari) di pojok layar.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="bg-black/50 p-2 rounded-lg">
                    <PlusSquare className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">2. Pilih Install / Add</h4>
                    <p className="text-xs text-gray-500 mt-1">Pilih "Instal Aplikasi" atau "Tambahkan ke Layar Beranda".</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowManualInstruction(false)}
                className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
              >
                Mengerti
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
