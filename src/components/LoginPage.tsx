import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Zap,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Button, Input, Card } from './ui/Base';
import { ApexLogo } from './ui/ApexLogo';

const LoginPage: React.FC = () => {
  const { 
    email, setEmail, password, setPassword, authError, handleLogin, isAuthLoading, deferredPrompt, handleInstallApp, isInstallModalOpen, setIsInstallModalOpen
  } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'admin' | 'pelaksana'>('pelaksana');

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-foreground overflow-hidden relative selection:bg-primary/30 bg-background font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent)] pointer-events-none" />
      
      {/* Auth Loading Overlay */}
      <AnimatePresence>
        {isAuthLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-2xl flex flex-col items-center justify-center gap-8"
          >
             <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-32 h-32 rounded-full border-t-2 border-r-2 border-primary"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Zap className="w-8 h-8 text-primary animate-pulse" />
                </div>
             </div>
             <div className="text-center space-y-2">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Verifikasi Jalur...</h2>
                <p className="text-[10px] font-black uppercase text-primary/60 tracking-[0.4em] animate-pulse">Menghubungkan ke Shaka-Core Secure Gateway</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Left Side: Branding / Visual (Hidden on small) */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-20 z-10 flex-col overflow-hidden">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 0.03 }}
           transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
           className="absolute pointer-events-none"
        >
           <Zap size={600} className="text-primary" />
        </motion.div>

        <div className="relative z-10 space-y-8 max-w-xl self-start">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-6"
          >
            <ApexLogo className="w-24 h-24" size={32} />
            <div className="drop-shadow-2xl">
              <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none">
                Toll-Guard<br/><span className="text-primary italic">Apex Pro.</span>
              </h1>
              <p className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.5em] mt-3">Advanced Infrastructure Intelligence</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 pt-12"
          >
            <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
              Presisi dalam <span className="text-primary/95">Eksekusi</span>,<br />
              Akurasi dalam <span className="text-primary">Data</span>.
            </h2>
            <p className="text-foreground/70 text-sm leading-relaxed font-medium bg-background/30 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl max-w-lg">
              Sistem manajemen terintegrasi untuk pemeliharaan infrastruktur jalan tol PT. Shaka Anugerah Karya. Keamanan dan efisiensi dalam setiap titik pengerjaan.
            </p>
            
            <div className="flex gap-10 pt-6">
               <div className="bg-background/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl flex-1 text-center group hover:border-primary/30 transition-all">
                  <p className="text-4xl font-black text-primary italic tracking-tighter group-hover:scale-110 transition-transform">100%</p>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-3 opacity-50">Global Uptime</p>
               </div>
               <div className="bg-background/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl flex-1 text-center group hover:border-primary/30 transition-all">
                  <p className="text-4xl font-black text-primary italic tracking-tighter group-hover:scale-110 transition-transform">SECURE</p>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-3 opacity-50">IDENTITY SYNC</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-[0.8] flex items-center justify-center p-6 sm:p-12 z-10 bg-background/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none">
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative"
        >
          {/* Decorative Glow */}
          <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

          {/* Glass Card Wrapper */}
          <Card className="p-12 md:p-16 space-y-12 rounded-[4rem] border-primary/10 shadow-[0_0_80px_rgba(0,0,0,0.4)] relative bg-background/60 backdrop-blur-3xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none rotate-45">
               <ApexLogo className="w-40 h-40" />
            </div>

            <div className="absolute top-12 right-12 md:hidden">
                <ApexLogo className="w-12 h-12" size={24} />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex bg-muted/30 p-1.5 rounded-3xl border border-white/5 backdrop-blur-sm w-full gap-1">
                   <button 
                     type="button" 
                     onClick={() => setLoginMode('pelaksana')}
                     className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${loginMode === 'pelaksana' ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-[1.02]' : 'text-foreground/50 hover:text-primary hover:bg-white/5'}`}
                   >
                     <Zap className="w-4 h-4" /> Pelaksana Lapangan
                   </button>
                   <button 
                     type="button" 
                     onClick={() => { setLoginMode('admin'); setEmail(''); setPassword(''); }}
                     className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${loginMode === 'admin' ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-[1.02]' : 'text-foreground/50 hover:text-primary hover:bg-white/5'}`}
                   >
                     <ShieldCheck className="w-4 h-4" /> Admin / Owner
                   </button>
                 </div>
              </div>
              <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Login.</h3>
              <p className="text-xs text-foreground/40 font-black uppercase tracking-[0.2em] mt-2">Authorized Ops Gateway</p>
            </div>

            <form onSubmit={(e) => {
              if (loginMode === 'pelaksana') {
                e.preventDefault();
                // Set email silently and trigger login
                setEmail('pelaksana.shaka@gmail.com');
                // Password is the token
                handleLogin(e, true); 
              } else {
                handleLogin(e);
              }
            }} className="space-y-8 relative z-10">
              <AnimatePresence mode="wait">
                {loginMode === 'admin' ? (
                  <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-foreground/30 ml-3 tracking-[0.4em]">Personal Identity / Email</label>
                      <div className="relative group">
                        <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-all duration-200" />
                        <Input 
                          type="text" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-16 h-16 rounded-[2.5rem] bg-muted/20 border-white/5 focus:ring-primary/30 transition-all font-black italic text-lg shadow-inner"
                          placeholder="Input ID / Email"
                          required={loginMode === 'admin'}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-foreground/30 ml-3 tracking-[0.4em]">Encrypted Cipher (Sandi)</label>
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-all duration-200" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-16 pr-16 h-16 rounded-[2.5rem] bg-muted/20 border-white/5 focus:ring-primary/30 transition-all font-black italic text-lg shadow-inner"
                          placeholder="Password"
                          required={loginMode === 'admin'}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-all active:scale-90"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="pelaksana" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-foreground/30 ml-3 tracking-[0.4em]">Kode Akses Sekali Pakai (Referral)</label>
                      <div className="relative group">
                        <Zap className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-all duration-200" />
                        <Input 
                          type="text"
                          value={password}
                          onChange={(e) => setPassword(e.target.value.toUpperCase().replace(/\s/g, ''))}
                          className="pl-16 pr-6 h-20 rounded-[2.5rem] bg-muted/20 border-white/5 focus:ring-primary/30 transition-all font-black italic text-2xl shadow-inner tracking-widest uppercase text-primary placeholder:text-primary/20"
                          placeholder="CTH: ABX-123"
                          required={loginMode === 'pelaksana'}
                          maxLength={12}
                        />
                      </div>
                      <p className="text-[9px] font-black text-foreground/40 ml-4 italic mt-2 uppercase tracking-widest text-primary/60">Dapatkan kode dari grup WA atau Admin Lapangan</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {authError && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.9, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: -10 }}
                     transition={{ duration: 0.2 }}
                     className="p-6 bg-rose-500/10 border border-rose-500/20 backdrop-blur-md text-rose-500 rounded-[2rem] text-[10px] font-black uppercase text-center flex flex-col items-center justify-center gap-2 italic"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4" />
                      <span>{authError}</span>
                    </div>
                    {authError.includes('ID / Password salah') && (
                      <p className="text-[8px] opacity-70 mt-1">Sandi Default: No. HP terdaftar atau Hubungi Admin.</p>
                    )}
                    {authError.includes('auth/invalid-credential') && (
                      <p className="text-[8px] opacity-70 mt-1">Kesalahan Kredensial Firebase. Pastikan detail di Auth Panel sesuai dengan Database.</p>
                    )}
                    {authError.includes('Network Error') && (
                      <div className="flex flex-col gap-2 mt-2 w-full">
                        <button 
                          type="button" 
                          onClick={() => {
                            if ('caches' in window) { caches.keys().then(names => { names.forEach(name => caches.delete(name)); }); }
                            window.location.reload();
                          }}
                          className="bg-rose-500 text-white px-6 py-3 rounded-full text-[10px] uppercase font-black tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-lg w-full"
                        >
                          Hapus Cache & Muat Ulang
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            window.open(window.location.href, '_blank');
                          }}
                          className="bg-white text-rose-600 px-6 py-3 rounded-full text-[10px] uppercase font-black tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-lg w-full border border-rose-500"
                        >
                          Buka di Tab Baru (Fix Blokir)
                        </button>
                        <p className="text-[7px] opacity-80 mt-1 uppercase">Jika memakai mode rahasia/private, iframe akan memblokir proses masuk. Silakan buka di tab baru.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit"
                className="w-full h-20 rounded-[2.5rem] text-[14px] font-black italic uppercase tracking-[0.3em] group shadow-2xl shadow-primary/30 border-2 border-primary/20 hover:bg-primary hover:text-black transition-all"
              >
                Launch Sesi <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-3 transition-transform" />
              </Button>
            </form>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">Atau</span>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>
              <Button 
                onClick={useApp().handleGoogleLogin}
                type="button"
                variant="outline"
                className="w-full h-16 rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 border-white/10 hover:bg-white/5 transition-all text-foreground/80"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Masuk dengan Google
              </Button>
            </div>

            <div className="pt-12 border-t border-white/5 space-y-6 relative z-10">
               <div className="flex flex-col sm:flex-row items-center justify-between gap-6 opacity-40">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-4 h-4 text-primary" />
                     <span className="text-[9px] font-black uppercase tracking-widest">Vault ID Protected</span>
                  </div>
                  <p className="text-[9px] font-black text-foreground/70 uppercase tracking-[0.5em]">Shaka-Core v2</p>
               </div>
            </div>
          </Card>

          {/* Quick Install Banner for Web Users */}
          {!window.matchMedia('(display-mode: standalone)').matches && !(navigator as any).standalone && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
               className="w-full mt-4"
             >
                <div onClick={() => handleInstallApp() }
                     className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border-2 border-emerald-500/30 rounded-[2.5rem] p-6 cursor-pointer transition-all flex items-center justify-between group shadow-lg shadow-emerald-500/10 relative overflow-hidden backdrop-blur-xl">
                   <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none rotate-12">
                     <Download className="w-24 h-24 text-emerald-500" />
                   </div>
                   <div className="flex items-center gap-5 relative z-10">
                      <div className="w-14 h-14 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                         <Download className="w-6 h-6 animate-bounce" />
                      </div>
                      <div>
                         <h4 className="text-[13px] font-black uppercase italic tracking-widest text-emerald-500">Pasang Aplikasi Sekarang</h4>
                         <p className="text-[9px] font-bold text-emerald-500/70 tracking-widest uppercase mt-1 max-w-[200px]">Akses lebih cepat & ringan tanpa buka browser.</p>
                      </div>
                   </div>
                   <ChevronRight className="w-6 h-6 text-emerald-500 group-hover:translate-x-2 transition-transform relative z-10" />
                </div>
             </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/5"
      >
        <button onClick={onClose} className="absolute right-6 top-6 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        {children}
      </motion.div>
    </div>
  );
};
