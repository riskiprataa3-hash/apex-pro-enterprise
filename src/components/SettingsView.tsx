import React, { useState } from 'react';
import { Card, Input, Button } from './ui/Base';
import { User as UserIcon, Lock, CheckCircle2, Download, Mail, ShieldCheck, Smartphone, Maximize2, Image as ImageIcon, Camera, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { updatePassword, getAuth, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const SettingsView = () => {
  const { user, userProfile, isAdmin, handleSendEmailVerification, deferredPrompt, adminAccessCode, updateAdminAccessCode, headerText, handleUpdateHeaderText, announcementText, handleUpdateAnnouncementText, handleUpdateMyProfile } = useApp();
  const isOwnerOrDev = user?.email && ['developmentshaka@gmail.com', 'development.shaka@gmail.com'].includes(user.email.toLowerCase());
  const isTrustedAccount = isOwnerOrDev || (user?.email && /^(admin|pelaksana)\.shaka\d{0,2}@gmail\.com$/.test(user.email.toLowerCase()));

  const isEmailVerified = user?.emailVerified || isTrustedAccount;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Profile Edits
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
     name: '', regu: '', jabatan: '', kodeUnit: '', region: '', unitInduk: ''
  });

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');
  const [tempAccessCode, setTempAccessCode] = useState(adminAccessCode || '');
  const [bgInput, setBgInput] = useState(localStorage.getItem('shaka_bg_img') || '');
  
  const [tempHeader, setTempHeader] = useState("");
  const [tempAnnouncement, setTempAnnouncement] = useState("");

  React.useEffect(() => {
    if (adminAccessCode) setTempAccessCode(adminAccessCode);
  }, [adminAccessCode]);
  
  React.useEffect(() => {
     setTempHeader(headerText);
  }, [headerText]);
  
  React.useEffect(() => {
     setTempAnnouncement(announcementText);
  }, [announcementText]);

  React.useEffect(() => {
     if (userProfile) {
        setEditProfileData({
           name: userProfile.name || '',
           regu: userProfile.regu || '',
           jabatan: userProfile.jabatan || '',
           kodeUnit: userProfile.kodeUnit || '',
           region: userProfile.region || '',
           unitInduk: userProfile.unitInduk || '',
        });
     }
  }, [userProfile]);

  const handleUpdateProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setUploadingPhoto(true);
      const storage = getStorage();
      const fileRef = ref(storage, `profiles/${user.uid || user.email}/${file.name}`);
      await uploadBytes(fileRef, file);
      const photoURL = await getDownloadURL(fileRef);
      
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
        // Force refresh by reloading or updating state
        window.location.reload();
      }
    } catch (err) {
      console.error("Gagal mengupload foto profil:", err);
      alert("Gagal mengupload foto profil");
    } finally {
      setUploadingPhoto(false);
    }
  };

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-card p-6 rounded-[2rem] border border-border/50 gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-[1.5rem]">
            <UserIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Pengaturan Akun</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Kelola profil dan keamanan
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.dispatchEvent(new CustomEvent('trigger-logout'))}
          className="h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 hover:text-rose-600 border-none font-black uppercase tracking-widest text-[10px] sm:w-auto w-full shadow-sm"
        >
          <LogOut className="w-4 h-4 mr-2" strokeWidth={2.5} />
          Keluar (Logout)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Account Info */}
        <Card className="p-6 md:p-8 space-y-6 rounded-[2rem] border border-border/50 shadow-sm bg-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
               <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary overflow-hidden border-2 border-primary/20 p-1">
                 <img src={user?.photoURL || "/icon.svg"} alt="Profile" className="w-full h-full object-contain object-center" />
               </div>
               <label className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-2xl cursor-pointer transition-colors">
                 {uploadingPhoto ? <span className="text-[8px] font-bold">...</span> : <Camera className="w-5 h-5 shadow-sm" />}
                 <input type="file" accept="image/*" className="hidden" onChange={handleUpdateProfilePhoto} disabled={uploadingPhoto} />
               </label>
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase italic tracking-tighter">{userProfile?.name || 'User'}</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{user?.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                   <ShieldCheck className="w-3 h-3 text-primary" />
                   <span className="text-[8px] font-bold uppercase text-primary tracking-widest">{isAdmin ? 'Administrator' : 'Pelaksana'}</span>
                </div>
                {isEmailVerified ? (
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                     <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                     <span className="text-[8px] font-bold uppercase text-emerald-500 tracking-widest">
                       {isTrustedAccount ? 'System Verified' : 'Email Terverifikasi'}
                     </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                     <Mail className="w-3 h-3 text-rose-500" />
                     <span className="text-[8px] font-bold uppercase text-rose-500 tracking-widest">Email Belum Verifikasi</span>
                  </div>
                )}
              </div>
              
              {!isEmailVerified && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-relaxed">
                     Verifikasi Gmail Anda untuk meningkatkan keamanan dan mengaktifkan fitur penuh.
                   </p>
                   <Button 
                     variant="outline" 
                     className="w-full h-12 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-500/10"
                     onClick={() => handleSendEmailVerification()}
                   >
                     Kirim Link Verifikasi
                   </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-6 border-t border-border">
             <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Informasi Profil</span>
                <Button 
                   variant="outline" 
                   className="h-8 text-[10px] font-bold uppercase tracking-widest px-4 rounded-full"
                   onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                   {isEditingProfile ? 'Batal' : 'Edit Profil'}
                </Button>
             </div>
             
             {isEditingProfile ? (
                <form 
                  onSubmit={async (e) => {
                     e.preventDefault();
                     await handleUpdateMyProfile(editProfileData);
                     setIsEditingProfile(false);
                  }}
                  className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
                        <Input value={editProfileData.name} onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Regu Khusus</label>
                        <Input value={editProfileData.regu} onChange={e => setEditProfileData({...editProfileData, regu: e.target.value})} placeholder="Opsional" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Jabatan Terakhir</label>
                        <Input value={editProfileData.jabatan} onChange={e => setEditProfileData({...editProfileData, jabatan: e.target.value})} placeholder="Opsional" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Kode Unit</label>
                        <Input value={editProfileData.kodeUnit} onChange={e => setEditProfileData({...editProfileData, kodeUnit: e.target.value})} placeholder="Opsional" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Region / UP3</label>
                        <Input value={editProfileData.region} onChange={e => setEditProfileData({...editProfileData, region: e.target.value})} placeholder="Opsional" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Unit Induk</label>
                        <Input value={editProfileData.unitInduk} onChange={e => setEditProfileData({...editProfileData, unitInduk: e.target.value})} placeholder="Opsional" />
                     </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest mt-2 hover:scale-[1.02] transition-all">Simpan Profil</Button>
                </form>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="bg-muted p-3 rounded-2xl border border-border">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-primary block mb-1">Regu Khusus</span>
                      <span className="text-sm font-bold">{userProfile?.regu || '-'}</span>
                   </div>
                   <div className="bg-muted p-3 rounded-2xl border border-border">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-primary block mb-1">Jabatan</span>
                      <span className="text-sm font-bold">{userProfile?.jabatan || '-'}</span>
                   </div>
                   <div className="bg-muted p-3 rounded-2xl border border-border">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 block mb-1">Kode Unit</span>
                      <span className="text-sm font-bold">{userProfile?.kodeUnit || '-'}</span>
                   </div>
                   <div className="bg-muted p-3 rounded-2xl border border-border">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 block mb-1">Region / UP3</span>
                      <span className="text-sm font-bold">{userProfile?.region || '-'}</span>
                   </div>
                   <div className="bg-muted p-3 rounded-2xl border border-border sm:col-span-2">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500 block mb-1">Unit Induk</span>
                      <span className="text-sm font-bold">{userProfile?.unitInduk || '-'}</span>
                   </div>
                </div>
             )}
          </div>
        </Card>

        {/* Password Reset */}
         <Card className="p-5 space-y-6">
            <h3 className="text-sm font-bold uppercase italic tracking-tighter flex items-center gap-2 mb-2">
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
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Sandi Baru</label>
                <Input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Konfirmasi Sandi Baru</label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-[10px] font-bold uppercase tracking-widest mt-2 hover:scale-[1.02] active:scale-95 transition-all">
                 {loading ? 'Menyimpan...' : 'Perbarui Sandi'}
              </Button>
            </form>
         </Card>



         {/* Text Management (Dev Only) */}
         {isOwnerOrDev && (
           <Card className="p-5 space-y-6 border-primary/20 bg-primary/5">
             <h3 className="text-sm font-bold uppercase italic tracking-tighter flex items-center gap-2 mb-2 text-primary">
               <ShieldCheck className="w-4 h-4" />
               Ubah Teks Tampilan (Dev)
             </h3>
             <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
               Ubah kata-kata di header aplikasi atau teks pengumuman yang muncul pada dashboard operator. Perubahan ini akan memengaruhi seluruh pengguna.
             </p>

             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Teks Header Utama (Saat Ini: "{headerText}")</label>
                 <div className="flex gap-2">
                    <Input 
                      type="text" 
                      value={tempHeader}
                      onChange={(e) => setTempHeader(e.target.value)}
                      className="h-12 rounded-xl text-xs"
                      placeholder="Masukkan teks header (Misal: CPO)"
                    />
                    <Button 
                      className="h-12 rounded-xl px-6 shrink-0" 
                      onClick={() => handleUpdateHeaderText(tempHeader)}
                    >
                       Ubah Teks Header
                    </Button>
                 </div>
               </div>
               <div className="space-y-2 mt-4">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Teks Pengumuman (Running Text)</label>
                 <div className="space-y-2">
                    <textarea 
                      value={tempAnnouncement}
                      onChange={(e) => setTempAnnouncement(e.target.value)}
                      className="w-full h-24 bg-background border border-border rounded-xl p-4 text-xs focus:ring-2 ring-primary outline-none"
                      placeholder="Masukkan pengumuman penting..."
                    />
                    <Button 
                      className="w-full h-12 rounded-xl" 
                      onClick={() => handleUpdateAnnouncementText(tempAnnouncement)}
                    >
                       Update Pengumuman Global
                    </Button>
                 </div>
               </div>
             </div>
           </Card>
         )}

        {/* Access Code Management (Admin Only) */}
        {isOwnerOrDev && (
          <Card className="p-5 space-y-6 border-primary/20 bg-primary/5">
            <h3 className="text-sm font-bold uppercase italic tracking-tighter flex items-center gap-2 mb-2 text-primary">
              <Smartphone className="w-4 h-4" />
              Master Kode Akses Pelaksana
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
              Kode ini digunakan oleh pelaksana lapangan untuk masuk ke sistem tanpa login individual. Kode disimpan secara publik untuk verifikasi namun hanya dapat diubah oleh Admin.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Master Kode Akses (Referral)</label>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <Input 
                      type="text" 
                      value={tempAccessCode}
                      onChange={(e) => setTempAccessCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                      className="h-16 rounded-2xl bg-background/50 border-primary/20 text-xl font-bold italic tracking-widest text-primary text-center"
                      placeholder="897161"
                      maxLength={12}
                    />
                    <Button 
                      variant="outline"
                      className="h-16 px-6 aspect-square rounded-2xl border-primary/20 hover:bg-primary hover:text-black transition-all group"
                      onClick={() => {
                          const random = Math.floor(100000 + Math.random() * 900000).toString();
                          setTempAccessCode(random);
                      }}
                      title="Generate Random Code"
                    >
                      <Maximize2 className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest italic flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group"
                    onClick={async () => {
                      try {
                        await updateAdminAccessCode(tempAccessCode);
                        alert(`Kode baru berhasil dibuat: ${tempAccessCode}`);
                      } catch (e) {
                        alert("Gagal memperbarui kode akses.");
                      }
                    }}
                    disabled={!tempAccessCode}
                  >
                    <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Update Kunci Akses
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                 <CheckCircle2 className="w-4 h-4 text-primary" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Status: Dokumen Firestore Terhubung & Publik.</span>
              </div>
            </div>
          </Card>
        )}
      </div>

    </div>
  );
};
