import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Toaster, toast } from 'sonner';
import {SplashScreen} from './components/SplashScreen';
import { InstallGuide } from './components/InstallGuide';

const DashboardPage = lazy(() => import('./components/DashboardPage'));
const ProjectDetailPage = lazy(() => import('./components/ProjectDetailPage'));
const ChatCenter = lazy(() => import('./components/ChatCenter').then(module => ({ default: module.ChatCenter })));
const LiteModePage = lazy(() => import('./components/LiteModePage'));
const ClockPage = lazy(() => import('./pages/ClockPage'));

const PageLoader = () => (
  <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-8 h-8 text-primary animate-spin" />
    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest animate-pulse">Memuat Modul...</p>
  </div>
);

const MainApp: React.FC = () => {
  const { user, authLoading } = useApp();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  
  // PWA Registration & Updates
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.warn('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast('Update Tersedia', {
        description: 'Terdapat versi baru aplikasi. Klik untuk perbarui.',
        action: {
          label: 'Perbarui',
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
        icon: <DownloadCloud className="w-5 h-5 text-primary" />,
      });
    }
  }, [needRefresh, updateServiceWorker]);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      
      {!showSplash && (
        <div 
          className="min-h-screen flex flex-col overflow-x-hidden selection:bg-primary/30 relative z-10 w-full text-foreground duration-500"
        >
          <Toaster position="top-center" expand={true} richColors closeButton />
          <InstallGuide />

          {!user ? (
            <LoginPage />
          ) : (
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <motion.main
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex-1 flex flex-col w-full overflow-x-hidden"
                >
                  <Routes location={location}>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/project/:projectId" element={<ProjectDetailPage />} />
                      <Route path="/chat" element={<ChatCenter />} />
                      <Route path="/lite" element={<LiteModePage />} />
                      <Route path="/clock" element={<ClockPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </motion.main>
              </AnimatePresence>
            </Suspense>
          )}
        </div>
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
