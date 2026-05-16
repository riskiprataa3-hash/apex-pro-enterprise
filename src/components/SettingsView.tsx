import React, { useState } from 'react';
import { Card, Input, Button } from './ui/Base';
import { User as UserIcon, Lock, CheckCircle2, Download, Mail, ShieldCheck, Smartphone, Maximize2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { updatePassword, getAuth } from 'firebase/auth';

export const SettingsView = () => {
  const { user, userProfile, isAdmin, handleSendEmailVerification, deferredPrompt, handleInstallApp } = useApp();
  const isTrustedAccount = user?.email && [
    'developmentshaka@gmail.com',
    'admin.shaka01@gmail.com',
    'riskiprataa3@gmail.com',
    'pelaksana.shaka@gmail.com'
  ].includes(user.email.toLowerCase());

  const isEmailVerified = user?.emailVerified || isTrustedAccount;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Sandi tidak cocok');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Sandi minimal 6 karakter');
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordSuccess('Sandi berhasil diperbarui. Silakan gunakan sandi baru untuk login selanjutnya.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError('Sesi tidak valid.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        setPasswordError('Pemutakhiran sandi memerlukan login terbaru. Harap logout dan login kembali untuk mengubah sandi.');
      } else {
        setPasswordError('Gagal mengubah sandi: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-[2rem] border border-border gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <UserIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Pengaturan Akun</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
              Kelola profil dan keamanan
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Info */}
        <Card className="p-8 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl font-black text-primary">
              {userProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic tracking-tighter">{userProfile?.name || 'User'}</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                   <ShieldCheck className="w-3 h-3 text-primary" />
                   <span className="text-[8px] font-black uppercase text-primary tracking-widest">{isAdmin ? 'Administrator' : 'Pelaksana'}</span>
                </div>
                {isEmailVerified ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                     <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                     <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">
                       {isTrustedAccount ? 'System Verified' : 'Email Terverifikasi'}
                     </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                     <Mail className="w-3 h-3 text-rose-500" />
                     <span className="text-[8px] font-black uppercase text-rose-500 tracking-widest">Email Belum Verifikasi</span>
                  </div>
                )}
              </div>
              
              {!isEmailVerified && (
                <div className="mt-6 p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                   <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-relaxed">
                     Verifikasi Gmail Anda untuk meningkatkan keamanan dan mengaktifkan fitur penuh.
                   </p>
                   <Button 
                     variant="outline" 
                     className="w-full h-12 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-500/10"
                     onClick={() => handleSendEmailVerification()}
                   >
                     Kirim Link Verifikasi
                   </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Password Reset */}
         <Card className="p-8 space-y-6">
            <h3 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-primary" />
              Ubah Sandi Akun
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
              Pastikan Anda menggunakan sandi yang kuat dan belum pernah digunakan sebelumnya.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && <p className="text-[10px] text-rose-500 font-bold p-3 bg-rose-500/10 rounded-xl">{passwordError}</p>}
              {passwordSuccess && <p className="text-[10px] text-emerald-500 font-bold p-3 bg-emerald-500/10 rounded-xl">{passwordSuccess}</p>}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sandi Baru</label>
                <Input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Konfirmasi Sandi Baru</label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 hover:scale-[1.02] active:scale-95 transition-all">
                 {loading ? 'Menyimpan...' : 'Perbarui Sandi'}
              </Button>
            </form>
         </Card>
        {/* Database Migration */}
        {true && (
          <>
            <Card className="p-8 space-y-6 md:col-span-1 lg:col-span-2 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <Download className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black uppercase italic tracking-tighter">
                Migrasi Database (ai-studio-*** ke shaka-v4)
              </h3>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
              Gunakan fitur ini untuk menyalin data dari database lama (yang terkena limit) ke database baru (Blaze). 
              Pindahkan data saat limit database lama sudah direset (biasanya jam 14.00 WIB atau keesokan harinya).
            </p>

            <div className="space-y-4">
              {migrationStatus && (
                <div className="p-4 bg-muted/50 rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest text-center">
                  {migrationStatus}
                </div>
              )}
              <Button 
                disabled={isMigrating}
                onClick={async () => {
                  try {
                    setIsMigrating(true);
                    setMigrationStatus('Memulai migrasi... Menghubungkan ke database.');
                    const { db } = await import('../firebase');
                    const { getFirestore, collection, getDocs, setDoc, doc } = await import('firebase/firestore');
                    const auth = getAuth();
                    // old DB is ai-studio-tollguardapexpro-9c2abefd-3d7f-4bec-bc2c-956b717de4ac
                    const oldDb = getFirestore(auth.app, "ai-studio-tollguardapexpro-9c2abefd-3d7f-4bec-bc2c-956b717de4ac");
                    // current db (shaka-v4)
                    const newDb = db;
                    
                    const collections = ["workers", "projects", "activities", "fuel_logs", "hse_logs", "apd_checks", "incidents", "chat_messages", "login_logs", "tasks", "inventory"];
                    
                    let totalCopied = 0;
                    for (const colName of collections) {
                      setMigrationStatus(`Menyalin data ${colName}...`);
                      const snap = await getDocs(collection(oldDb, colName));
                      for (const docSnap of snap.docs) {
                        await setDoc(doc(newDb, colName, docSnap.id), docSnap.data());
                        totalCopied++;
                        
                        if (colName === "projects") {
                          const entriesSnap = await getDocs(collection(oldDb, "projects", docSnap.id, "entries"));
                          for (const entrySnap of entriesSnap.docs) {
                            await setDoc(doc(newDb, "projects", docSnap.id, "entries", entrySnap.id), entrySnap.data());
                            totalCopied++;
                          }
                        }
                      }
                    }
                    setMigrationStatus(`Migrasi sukses! ${totalCopied} dokumen berhasil disalin.`);
                  } catch (e: any) {
                    console.error(e);
                    if (e.message?.includes('Quota exceeded')) {
                      setMigrationStatus(`Migrasi gagal: Kuota harian database lama sudah habis. Harap tunggu sampai limit direset.`);
                    } else {
                      setMigrationStatus(`Migrasi gagal: ${e.message}`);
                    }
                  } finally {
                    setIsMigrating(false);
                  }
                }}
                className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isMigrating ? "Sedang Memigrasi..." : "Jalankan Migrasi Data"}
              </Button>
            </div>
          </Card>
        </>
      )}
      </div>

    </div>
  );
};
