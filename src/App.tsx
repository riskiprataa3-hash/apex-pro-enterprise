import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import {SplashScreen} from './components/SplashScreen';
import InstallPWA from './components/InstallPWA';


import DashboardPage from './components/DashboardPage';
import ProjectDetailPage from './components/ProjectDetailPage';
import { ChatCenter } from './components/ChatCenter';
import LiteModePage from './components/LiteModePage';

const PageLoader = () => (
  <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest animate-pulse">Loading Module...</p>
  </div>
);

const MainApp: React.FC = () => {
  const { user, authLoading, isOutsideGeofence } = useApp();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Attempt to lock screen orientation to portrait
    if (window.screen && window.screen.orientation && (window.screen.orientation as any).lock) {
      try {
        (window.screen.orientation as any).lock('portrait').catch(() => {
          console.warn("Screen orientation lock is not supported or was blocked");
        });
      } catch (err) {
        console.warn("Screen orientation lock failed", err);
      }
    }
  }, []);




  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      
      {!showSplash && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen flex flex-col overflow-x-hidden selection:bg-primary/30 relative z-10 w-full text-foreground"
        >
          <Toaster position="top-center" expand={true} richColors closeButton />
          <InstallPWA />
          
          {/* Geofence Block Overlay */}
          <AnimatePresence>
            {isOutsideGeofence && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-24 h-24 rounded-3xl bg-rose-500/10 flex items-center justify-center mb-8 border border-rose-500/20">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <DownloadCloud className="w-10 h-10 text-rose-500 rotate-180" />
                  </motion.div>
                </div>
                <h2 className="text-4xl font-black italic uppercase italic tracking-tighter mb-4">Access Restricted.</h2>
                <p className="max-w-md text-muted-foreground font-medium text-sm leading-relaxed mb-6">
                  You are detected outside the designated task area. Access to operational modules is automatically suspended for data security.
                </p>
                <div className="p-4 bg-muted/50 rounded-2xl border border-white/5 text-[10px] uppercase font-black tracking-widest text-primary mb-8">
                  Status: Outside Geofence Radius
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-primary text-black font-black uppercase italic tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  Refresh GPS Coordinates
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!user ? (
            <LoginPage />
          ) : (
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <motion.main
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                  transition={{ type: "spring", stiffness: 800, damping: 40, ease: [0.25, 1, 0.5, 1] }}
                  className="flex-1 flex flex-col w-full overflow-x-hidden"
                >
                  <Routes location={location}>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/project/:projectId" element={<ProjectDetailPage />} />
                      <Route path="/chat" element={<ChatCenter />} />
                      <Route path="/lite" element={<LiteModePage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </motion.main>
              </AnimatePresence>
            </Suspense>
          )}
          

        </motion.div>
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
