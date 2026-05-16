import React from "react";
import { useApp } from "../context/AppContext";
import { Download, Smartphone, Zap, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function TombolInstallPWA() {
  const { deferredPrompt, handleInstallApp } = useApp();
  
  // Check if running as installed app (standalone)
  const [isStandalone, setIsStandalone] = React.useState(false);

  React.useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    };
    checkStandalone();
    
    const mql = window.matchMedia('(display-mode: standalone)');
    mql.addEventListener('change', checkStandalone);
    return () => mql.removeEventListener('change', checkStandalone);
  }, []);

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-[95%] max-w-sm"
      >
        <button 
          onClick={() => handleInstallApp()}
          className="w-full bg-primary text-black font-black uppercase italic text-[11px] py-4 px-6 rounded-2xl shadow-[0_15px_40px_rgba(var(--primary-rgb),0.4)] border-2 border-primary/20 flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
        >
          {/* Shimmer Effect */}
          <motion.div 
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
          
          <div className="relative flex items-center gap-3">
            <div className="p-2 bg-black/10 rounded-lg">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[8px] opacity-70 mb-0.5">OPTIMASI NATIVE</span>
              <span>PASANG KE LAYAR UTAMA</span>
            </div>
          </div>
          
          <div className="relative p-2 bg-black/10 rounded-lg group-hover:bg-black/20 transition-colors">
            {deferredPrompt ? <Zap className="w-4 h-4 fill-current animate-pulse" /> : <Download className="w-4 h-4" />}
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
