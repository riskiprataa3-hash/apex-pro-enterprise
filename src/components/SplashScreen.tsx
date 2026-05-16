import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { authLoading } = useApp();
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    // Ensure the splash stays for at least 1 second
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && minTimePassed) {
      onComplete();
    }
  }, [authLoading, minTimePassed]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#0a0a0b] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Animated glowing orbs (Optimized for performance) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 -left-20 w-[300px] h-[300px] rounded-full will-change-transform pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 70%)' }}
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 -right-20 w-[400px] h-[400px] rounded-full will-change-transform pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative will-change-transform"
        >
          {/* Logo container with pulse effect */}
          <motion.div 
            className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center relative shadow-xl overflow-hidden mb-8"
          >
            <motion.div
              animate={{ 
                y: [0, 96],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-x-0 top-0 h-1 bg-primary/30 will-change-transform"
            />
            <ShieldCheck className="w-12 h-12 text-primary z-10" />
          </motion.div>
        </motion.div>

        {/* Brand Text */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center gap-1 overflow-hidden"
          >
            {["T", "O", "L", "L", "-", "G", "U", "A", "R", "D"].map((letter, idx) => (
              <motion.span
                key={idx}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + idx * 0.04, type: "spring", bounce: 0.5 }}
                className="text-2xl font-black italic tracking-tighter will-change-transform"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-[10px] text-primary/80 uppercase font-black tracking-[0.5em] italic flex items-center justify-center gap-2"
          >
           Apex Pro <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
          className="mt-12 w-48 h-1 bg-white/5 rounded-full overflow-hidden relative"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2, ease: "circOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-primary to-amber-500 w-full rounded-full origin-left will-change-transform"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="mt-4 flex items-center gap-2 text-[8px] text-muted-foreground uppercase font-black tracking-widest"
        >
          <Activity className="w-3 h-3 animate-pulse text-amber-500" />
          <span>INITIALIZING SYSTEM...</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
