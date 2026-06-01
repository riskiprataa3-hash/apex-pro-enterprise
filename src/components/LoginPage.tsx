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
  Download,
  Fingerprint,
  Wallet,
  Activity,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Button, Input, Card } from './ui/Base';
import { ApexLogo } from './ui/ApexLogo';

const LoginPage: React.FC = () => {
  const { 
    email, setEmail, password, setPassword, authError, handleLogin, handleGoogleLogin, isAuthLoading, 
  } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'admin' | 'pelaksana'>('pelaksana');
  const bgImage = localStorage.getItem('shaka_bg_img') || '';

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-gray-900 overflow-hidden relative font-sans bg-black">
      {/* Background Ambience / Image */}
      {bgImage ? (
        <>
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#10233b] via-[#2e4c70] to-[#10233b] pointer-events-none z-0" />
      )}
      
      {/* Auth Loading Overlay */}
      <AnimatePresence>
        {isAuthLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center gap-6"
          >
             <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-24 h-24 rounded-full border-t-4 border-r-4 border-blue-600 border-opacity-30"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-b-4 border-l-4 border-blue-600"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
             </div>
             <div className="text-center space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">Verifying Credentials</h2>
                <p className="text-xs font-semibold uppercase text-blue-600 tracking-wider">Connecting to Server...</p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Left Side: Branding / Visual (Hidden on small) */}
      <div className="hidden md:flex flex-1 relative items-center justify-center p-20 z-10 flex-col overflow-hidden text-white">
        <div className="relative z-10 space-y-8 max-w-xl self-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-5"
          >
            <div className="p-3 bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl">
               <ApexLogo className="w-12 h-12" size={32} showText={false} />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
                Toll-Guard<br/>CPM (Core Pavement Management)
              </h1>
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-1">Operations Command</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 pt-12"
          >
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              Executive Operation<br />Integrated Infrastructure
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md font-medium">
              Advanced field operations system by PT. Shaka Anugerah Karya. Designed for speed, security, and precision on the field.
            </p>
            
            <div className="flex gap-6 pt-8">
               <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 flex-1 hover:bg-white/10 transition-colors shadow-2xl">
                  <Zap className="w-8 h-8 text-blue-400 mb-4" />
                  <p className="text-2xl font-black">90fps</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-gray-400">High Performance</p>
               </div>
               <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 flex-1 hover:bg-white/10 transition-colors shadow-2xl">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
                  <p className="text-2xl font-black">Secure</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-gray-400">Layered Encryption</p>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-[0.8] flex items-center justify-center p-6 sm:p-12 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Default Card UI */}
          <Card className="p-8 md:p-12 space-y-8 rounded-[2.5rem] border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.5)] bg-white/10 backdrop-blur-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="absolute top-8 right-8 md:hidden">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <ApexLogo className="w-6 h-6" size={20} />
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex bg-gray-50 p-1.5 rounded-2xl w-full gap-1 border border-gray-100">
                   <button 
                     type="button" 
                     onClick={() => setLoginMode('pelaksana')}
                     className={`flex-1 py-2.5 px-4 rounded-[12px] text-xs font-bold transition-all flex items-center justify-center gap-2 ${loginMode === 'pelaksana' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-blue-600'}`}
                   >
                     <UserIcon className="w-4 h-4" /> Operator
                   </button>
                   <button 
                     type="button" 
                     onClick={() => { setLoginMode('admin'); setEmail(''); setPassword(''); }}
                     className={`flex-1 py-2.5 px-4 rounded-[12px] text-xs font-bold transition-all flex items-center justify-center gap-2 ${loginMode === 'admin' ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-blue-600'}`}
                   >
                     <ShieldCheck className="w-4 h-4" /> Admin
                   </button>
                 </div>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight text-gray-900">Sign In</h3>
              <p className="text-sm font-medium text-gray-500">{loginMode === 'admin' ? 'Access monitoring dashboard and export' : 'Start logging in the field'}</p>
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
            }} className="space-y-6 relative z-10 w-full">
              <AnimatePresence mode="wait">
                {loginMode === 'admin' ? (
                  <motion.div key="admin" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 ml-1">Email / User ID</label>
                      <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input 
                          type="text" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium text-base text-gray-900"
                          placeholder="Enter email"
                          required={loginMode === 'admin'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 ml-1">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-12 pr-12 h-14 rounded-2xl bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-medium text-base text-gray-900"
                          placeholder="Enter password"
                          required={loginMode === 'admin'}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="pelaksana" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 ml-1">Field Code (Token)</label>
                      <div className="relative group">
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input 
                          type="text"
                          value={password}
                          onChange={(e) => setPassword(e.target.value.toUpperCase().replace(/\s/g, ''))}
                          className="pl-14 h-16 rounded-2xl bg-blue-50/50 border-blue-100 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-xl tracking-[0.2em] uppercase text-blue-900 placeholder:text-blue-200"
                          placeholder="E.g. PRJ-123"
                          required={loginMode === 'pelaksana'}
                          maxLength={12}
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-500 ml-1 mt-2">Get an active token from the Field Admin.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {authError && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-semibold text-center flex flex-col items-center gap-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{authError}</span>
                    </div>
                    {authError.includes('ID / Password salah') && (
                      <span className="text-[10px] text-rose-500/80">Please check your credentials again.</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={isAuthLoading}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
              >
                {isAuthLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Activity className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>Continue <ChevronRight className="w-5 h-5" /></>
                )}
              </Button>
            </form>
            
            <div className="relative mt-6 mb-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-gray-300/50"></div>
              </div>
              <div className="relative px-4">
                 <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 bg-white/50 backdrop-blur-xl px-3 py-1 rounded-full">Or sign in with</span>
              </div>
            </div>
            
            <Button 
               variant="outline"
               onClick={handleGoogleLogin}
               disabled={isAuthLoading}
               className="w-full h-14 rounded-2xl bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-sm transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 relative z-10"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.649-3.342-11.117-7.984l-6.574 5.051C9.646 39.67 16.307 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
               </svg>
               Google Account
            </Button>
            
          </Card>
          
          <p className="text-center mt-6 text-xs font-semibold text-gray-400">
            SYSTEM V4.2 <span className="mx-2">•</span> ENCRYPTED SECURE LOGIN
          </p>
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
