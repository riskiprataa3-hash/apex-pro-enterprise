import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, ShieldCheck, Zap, Cpu, Server, Wifi } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { authLoading } = useApp();
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [loadingText, setLoadingText] = useState('INITIALIZING CORE SYSTEM');

  const loadingSteps = [
    'ESTABLISHING SECURE CONNECTION',
    'VERIFYING ENCRYPTION KEYS',
    'LOADING CPM MODULES',
    'SYNCING CLOUD TELEMETRY',
    'OPTIMIZING FORENSIC AUDIT TRAILS',
    'SYSTEM READY'
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length - 1) {
        currentStep++;
        setLoadingText(loadingSteps[currentStep]);
      }
    }, 400);

    // Ensure the splash stays for at least 2.5 seconds
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && minTimePassed) {
      onComplete();
    }
  }, [authLoading, minTimePassed]);

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans"
    >
      {/* Intense Background Grid */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]"
      />
      
      {/* Animated Hexagonal/Radial Center Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-[600px] h-[600px] rounded-full will-change-transform pointer-events-none mix-blend-screen"
        style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(234, 179, 8, 0.2) 20%, transparent 40%, rgba(234, 179, 8, 0.2) 60%, transparent 100%)' }}
      />
      
      {/* Ambient Blue/Amber Glows */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: [0.25, 1, 0.5, 1] }}
        className="absolute top-0 -left-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 70%)' }}
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: [0.25, 1, 0.5, 1] }}
        className="absolute bottom-0 -right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center flex-1 justify-center w-full px-6 max-w-sm -mt-20">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
          className="relative will-change-transform flex justify-center mb-10"
        >
          {/* Complex Logo container */}
          <div className="relative">
            {/* Outer spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-6 border border-white/5 rounded-full border-t-amber-500/40 border-b-blue-500/20"
            />
            {/* Inner spinning ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 border border-white/5 rounded-full border-l-amber-500/30 border-r-transparent"
            />
            
            <motion.div 
              className="w-28 h-28 rounded-3xl bg-black/60 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center relative shadow-[0_0_40px_rgba(234,179,8,0.15)] overflow-hidden group"
            >
              {/* Radar scan effect */}
              <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent will-change-transform"
              />
              <ShieldCheck strokeWidth={1.5} className="w-14 h-14 text-amber-500 mb-1.5 z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              <div className="flex gap-1.5 z-10 mt-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" style={{ animationDelay: '200ms' }} />
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_rgba(234,179,8,0.8)]" style={{ animationDelay: '400ms' }} />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Brand Text */}
        <div className="text-center space-y-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay: 0.4 }}
            className="flex items-center justify-center gap-1 overflow-hidden"
          >
            {["T", "O", "L", "L", "-", "G", "U", "A", "R", "D"].map((letter, idx) => (
              <motion.span
                key={idx}
                initial={{ y: 10, opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.4 + idx * 0.05, ease: [0.25, 1, 0.5, 1] }}
                className="text-4xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] will-change-transform"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="h-[1px] w-6 bg-gradient-to-r from-transparent to-white/20" />
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-[0.6em] italic flex items-center justify-center gap-2">
             CPM <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
            </p>
            <div className="h-[1px] w-6 bg-gradient-to-l from-transparent to-white/20" />
          </motion.div>
        </div>

        {/* Progress System */}
        <div className="mt-16 w-full max-w-[280px] mx-auto">
           <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.8 }}
              className="flex justify-between items-end mb-2.5"
           >
              <div className="flex gap-2 items-center">
                 <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                 <motion.span 
                   key={loadingText}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-[9px] text-zinc-300 uppercase font-bold tracking-widest"
                 >
                   {loadingText}
                 </motion.span>
              </div>
              <span className="text-[9px] text-amber-500 uppercase font-black tracking-[0.2em] animate-pulse">
                v2.1.0
              </span>
           </motion.div>

           <motion.div
             initial={{ opacity: 0, scaleX: 0.8 }}
             animate={{ opacity: 1, scaleX: 1 }}
             transition={{ duration: 0.1, delay: 0.8 }}
             className="h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/10"
           >
             <motion.div
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 2.5, ease: [0.25, 1, 0.5, 1] }}
               className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-blue-500 rounded-full"
             />
           </motion.div>
           
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.1, delay: 1 }}
             className="flex justify-between items-center mt-4 text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em]"
           >
              <div className="flex items-center gap-1.5">
                 <Cpu className="w-3 h-3 text-zinc-400" /> SYS.OK
              </div>
              <div className="flex items-center gap-1.5">
                 <Server className="w-3 h-3 text-zinc-400" /> DBNB.OK
              </div>
              <div className="flex items-center gap-1.5">
                 <Wifi className="w-3 h-3 text-emerald-500/70" /> LINK.UP
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
