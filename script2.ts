import * as fs from 'fs';

let content = fs.readFileSync('src/components/AttendanceTab.tsx', 'utf-8');

const regex = /const KasbonManagement = \(\{ cashAdvances.*?\}\s*;\s*\}\s*;/s;

const newComponent = `const KasbonManagement = ({ cashAdvances, handleCreateCashAdvance, handleDeleteCashAdvance, handleUpdateCashAdvance, uploadFileToStorage, workers, isAdmin, user }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [workerId, setWorkerId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [note, setNote] = useState('');

  // Admin approval states
  const [approvingId, setApprovingId] = useState('');
  const [approvedAmount, setApprovedAmount] = useState<number | ''>('');
  const [isUploading, setIsUploading] = useState(false);

  const selectedWorker = workers.find((w: any) => w.id === workerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker || !amount) return;
    await handleCreateCashAdvance({
      workerEmail: selectedWorker.email,
      workerName: selectedWorker.name,
      amount: Number(amount),
      note
    });
    setIsAdding(false);
    setAmount('');
    setNote('');
    setWorkerId('');
  };

  const handleApprove = async (ca: any) => {
    if (!approvedAmount) return;
    await handleUpdateCashAdvance(ca.id, {
      status: 'approved',
      approvedAmount: Number(approvedAmount)
    });
    setApprovingId('');
  };

  const handleReject = async (id: string) => {
    await handleUpdateCashAdvance(id, {
      status: 'rejected'
    });
    setApprovingId('');
  };

  const handleTransferProofUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFileToStorage(file, 'transfer_proofs');
      await handleUpdateCashAdvance(id, { transferProofUrl: url });
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-6">
       <div className="flex justify-between items-center bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-amber-600 line-clamp-1">Manajemen Kasbon</h3>
            <p className="text-[10px] text-amber-700/80 uppercase font-bold tracking-widest leading-none mt-1">Pengajuan & Persetujuan Kasbon</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-amber-500 hover:bg-amber-600 text-white uppercase font-black tracking-widest text-[10px] rounded-xl shadow-lg leading-none">{isAdmin ? "+ Catat" : "+ Ajukan Kasbon"}</Button>
       </div>

       {isAdding && (
         <Card className="p-6 border-2 border-amber-500/20 bg-background/50 backdrop-blur-sm rounded-2xl shadow-xl animate-in zoom-in-95 duration-200">
           <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-black tracking-widest uppercase text-sm border-b border-border/50 pb-2 mb-4 text-amber-600">{isAdmin ? "Form Kasbon Baru" : "Pengajuan Kasbon"}</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Pilih Personil</label>
                <select 
                  required
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl h-12 px-4 shadow-sm text-sm uppercase font-bold text-primary"
                >
                  <option value="">-- PILIH PEKERJA --</option>
                  {workers.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.employeeId}) - Rate: Rp{Number(w.dailyRate || 0).toLocaleString('id-ID')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Nominal Pengajuan (Rp)</label>
                <Input type="number" required value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="Contoh: 50000" className="h-12 font-mono text-lg font-black tracking-wider" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Keterangan / Tujuan</label>
                <Input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Mis. Bensin, Makan siang..." required className="h-12" />
              </div>

              <div className="flex gap-4 pt-4 border-t border-border/50 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="uppercase flex-1 font-bold tracking-widest text-[10px] rounded-xl h-12">Batal</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white uppercase flex-1 font-bold tracking-widest text-[10px] rounded-xl h-12">{isAdmin ? "Cairkan Kasbon" : "Kirim Pengajuan"}</Button>
              </div>
           </form>
         </Card>
       )}

       <div className="space-y-3">
         {cashAdvances.sort((a: any, b: any) => b.timestamp - a.timestamp).map((ca: any) => (
           <Card key={ca.id} className={cn("flex flex-col p-4 border-l-4 bg-background/50 transition-all rounded-2xl rounded-l-none", ca.status === 'pending' ? 'border-l-amber-500' : ca.status === 'approved' ? 'border-l-emerald-500' : 'border-l-rose-500')}>
             <div className="flex justify-between w-full">
               <div>
                 <p className="text-[10px] font-bold text-muted-foreground mb-1">{new Date(ca.timestamp).toLocaleString('id-ID')}</p>
                 <h4 className="font-black text-lg uppercase tracking-tight leading-none mb-1">{ca.workerName}</h4>
                 <p className="text-xs text-muted-foreground">{ca.note || 'Tanpa keterangan'}</p>
                 <p className="text-[9px] text-muted-foreground mt-1">Diajukan: {ca.createdByName}</p>
               </div>
               
               <div className="flex flex-col items-end gap-2 text-right">
                 <div className="flex items-center gap-2">
                   {ca.status === 'pending' && <span className="bg-amber-500/10 text-amber-500 text-[10px] uppercase font-bold px-2 py-1 rounded-md">Pending</span>}
                   {ca.status === 'approved' && <span className="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold px-2 py-1 rounded-md">Approved</span>}
                   {ca.status === 'rejected' && <span className="bg-rose-500/10 text-rose-500 text-[10px] uppercase font-bold px-2 py-1 rounded-md">Rejected</span>}
                 </div>
                 
                 <span className="font-black text-foreground bg-muted/50 px-3 py-1.5 rounded-lg shadow-inner">
                   Rp {ca.amount.toLocaleString('id-ID')}
                 </span>

                 {(ca.status === 'approved' && ca.approvedAmount) && (
                   <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">
                     Di-acc: Rp {ca.approvedAmount.toLocaleString('id-ID')}
                   </span>
                 )}
               </div>
             </div>

             {/* Admin Actions for Pending Kasbon */}
             {isAdmin && ca.status === 'pending' && approvingId !== ca.id && (
               <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                 <Button size="sm" variant="outline" className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10" onClick={() => handleReject(ca.id)}>Tolak</Button>
                 <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => {
                   setApprovingId(ca.id);
                   setApprovedAmount(ca.amount);
                 }}>Proses Acc</Button>
               </div>
             )}

             {/* Approval Form */}
             {isAdmin && approvingId === ca.id && (
               <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in fade-in">
                 <label className="text-[10px] font-bold uppercase tracking-widest">Setujui Nominal (Rp)</label>
                 <div className="flex gap-2">
                   <Input type="number" value={approvedAmount} onChange={e => setApprovedAmount(Number(e.target.value))} className="h-10 text-sm font-bold" />
                   <Button onClick={() => handleApprove(ca)} className="h-10 bg-emerald-500 hover:bg-emerald-600">Konfirmasi Acc</Button>
                   <Button onClick={() => setApprovingId('')} variant="ghost" className="h-10">Batal</Button>
                 </div>
               </div>
             )}

             {/* Transfer Proof for Approved Kasbon */}
             {ca.status === 'approved' && (
               <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                 {ca.transferProofUrl ? (
                   <a href={ca.transferProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1">
                     <FileText className="w-3 h-3" /> Lihat Bukti Transfer
                   </a>
                 ) : (
                   <div className="text-xs text-muted-foreground flex items-center gap-2">
                     <AlertCircle className="w-3 h-3" /> Belum ada bukti transfer
                   </div>
                 )}
                 
                 {isAdmin && (
                   <div className="relative">
                     <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" onChange={(e) => handleTransferProofUpload(e, ca.id)} disabled={isUploading} />
                     <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold pointer-events-none" disabled={isUploading}>
                       {isUploading ? "Mengunggah..." : "+ Upload Bukti"}
                     </Button>
                   </div>
                 )}
               </div>
             )}

             {/* Delete for Admin */}
             {isAdmin && (
                <div className="mt-4 flex justify-end">
                  <button onClick={() => {
                    if (window.confirm('Hapus histori kasbon ini? Nominal akan hangus dari total rekap.')) handleDeleteCashAdvance(ca.id);
                  }} className="text-muted-foreground hover:text-rose-500 bg-background hover:bg-rose-500/10 border border-border transition-colors p-1.5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
             )}
           </Card>
         ))}
         {cashAdvances.length === 0 && (
           <div className="text-center py-8 text-muted-foreground text-xs uppercase tracking-widest font-bold">
             Belum ada data kasbon.
           </div>
         )}
       </div>
    </div>
  );
};`;

content = content.replace(regex, newComponent);

fs.writeFileSync('src/components/AttendanceTab.tsx', content, 'utf-8');
console.log('Done refactoring KasbonManagement');
