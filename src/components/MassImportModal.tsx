import React, { useState } from 'react';
import { Button, Input, cn } from "./ui/Base";
import { Database, Plus, CheckCircle2, RotateCw } from "lucide-react";
import { useApp } from "../context/AppContext";

export const MassImportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { user, projects } = useApp();
  const [massImportKMList, setMassImportKMList] = useState("");
  const [massImportFolder0, setMassImportFolder0] = useState("dokumentasi O%");
  const [massImportFolder50, setMassImportFolder50] = useState("dokumentasi 5O%");
  const [massImportFolder100, setMassImportFolder100] = useState("dokumentasi 10O%");
  const [massImportDate, setMassImportDate] = useState("");
  const [isMassImporting, setIsMassImporting] = useState(false);
  const [massImportStatusText, setMassImportStatusText] = useState("");

  if (!isOpen) return null;

  const executeMassImport = async () => {
    if (!massImportKMList.trim()) {
        alert("Daftar KM kosong");
        return;
    }
    const kms = massImportKMList.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if(kms.length === 0) return;
    
    setIsMassImporting(true);
    setMassImportStatusText("Menghubungkan ke Storage...");
    try {
        const { collection, doc, writeBatch } = await import('firebase/firestore');
        const { ref, listAll, getDownloadURL } = await import('firebase/storage');
        const { db, storage } = await import('../firebase');
        
        type PhotoData = { url: string; name: string };
        const fetchUrls = async (folderName: string): Promise<PhotoData[]> => {
            const folderRef = ref(storage, folderName);
            const res = await listAll(folderRef);
            const urls: PhotoData[] = [];
            for (const item of res.items) {
                urls.push({
                    url: await getDownloadURL(item),
                    name: item.name
                });
            }
            return urls;
        };

        setMassImportStatusText("Mengambil foto 0%...");
        const urls0 = await fetchUrls(massImportFolder0);
        setMassImportStatusText("Mengambil foto 50%...");
        const urls50 = await fetchUrls(massImportFolder50);
        setMassImportStatusText("Mengambil foto 100%...");
        const urls100 = await fetchUrls(massImportFolder100);
        
        function shuffleArray<T>(array: T[]): T[] {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        class SmartPhotoPicker {
            private originalUrls: PhotoData[];
            private pool: PhotoData[];

            constructor(urls: PhotoData[]) {
                this.originalUrls = [...urls];
                this.pool = shuffleArray(this.originalUrls);
            }

            pick(): PhotoData | null {
                if (this.originalUrls.length === 0) return null;
                if (this.pool.length === 0) {
                    this.pool = shuffleArray(this.originalUrls);
                }
                return this.pool.pop() || null;
            }
        }
        
        const picker0 = new SmartPhotoPicker(urls0);
        const picker50 = new SmartPhotoPicker(urls50);
        const picker100 = new SmartPhotoPicker(urls100);

        setMassImportStatusText("Menulis data ke Firestore (Dry-Run aktif)...");
        
        let pId = "";
        let NAMA_PROYEK = "PEKANBARU-DUMAI";
        const existingP = projects.find((p: any) => p.name.includes(NAMA_PROYEK) || p.name === NAMA_PROYEK);
        if (existingP) {
           pId = existingP.id;
        } else {
           alert("Proyek PEKANBARU-DUMAI tidak ditemukan. Pastikan proyek utama ada!");
           return;
        }

        let batches: any[] = [];
        let currentBatch = writeBatch(db);
        let opCount = 0;
        let currentBatchRefs: any[] = [];

        const defaultDate = new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
        const finalDate = (massImportDate && massImportDate.trim().length > 0) ? massImportDate : defaultDate;

        for(let i=0; i<kms.length; i++) {
           const km = kms[i];
           const rnd0 = picker0.pick();
           const rnd50 = picker50.pick();
           const rnd100 = picker100.pick();
           
           const appEntryRef = doc(collection(db, 'projects', pId, 'entries'));
           currentBatch.set(appEntryRef, {
               km: km,
               signType: "37x24",
               qty: 1,
               description: "Non-Frame",
               status: "completed",
               photos0: rnd0 ? [rnd0.url] : [],
               photos50: rnd50 ? [rnd50.url] : [],
               photos100: rnd100 ? [rnd100.url] : [],
               timestamp: Date.now(),
               ownerId: user?.uid || "SYSTEM",
               isArchived: false
           });
           currentBatchRefs.push(appEntryRef);
           
           const rawEntryRef = doc(collection(db, 'inlet_reports'));
           currentBatch.set(rawEntryRef, {
               nama_proyek: NAMA_PROYEK,
               jenis_pekerjaan: "inlet",
               tanggal: finalDate,
               km: km,
               ukuran: "37x24",
               jumlah: 1,
               foto_0: rnd0 ? rnd0.url : null,
               foto_50: rnd50 ? rnd50.url : null,
               foto_100: rnd100 ? rnd100.url : null,
               originalFileName0: rnd0 ? rnd0.name : null,
               originalFileName50: rnd50 ? rnd50.name : null,
               originalFileName100: rnd100 ? rnd100.name : null,
               keterangan: "Non-Frame",
               status_kemajuan: "100% DONE",
               timestamp: Date.now()
           });
           currentBatchRefs.push(rawEntryRef);
           
           opCount += 2;
           if(opCount >= 400) {
              batches.push({ batch: currentBatch, refs: currentBatchRefs });
              currentBatch = writeBatch(db);
              currentBatchRefs = [];
              opCount = 0;
           }
        }
        
        if (opCount > 0) {
            batches.push({ batch: currentBatch, refs: currentBatchRefs });
        }
        
        setMassImportStatusText("Mendorong data ke database...");
        
        let committedDocRefs: any[] = [];
        try {
            for (let i=0; i<batches.length; i++) {
                await batches[i].batch.commit();
                committedDocRefs.push(...batches[i].refs);
            }
        } catch (err: any) {
            console.error("Gagal push:", err);
            setMassImportStatusText("Gagal! Melakukan rollback...");
            try {
                let rollbackBatch = writeBatch(db);
                let rollbackCount = 0;
                for (const ref of committedDocRefs) {
                    rollbackBatch.delete(ref);
                    rollbackCount++;
                    if (rollbackCount >= 400) {
                        await rollbackBatch.commit();
                        rollbackBatch = writeBatch(db);
                        rollbackCount = 0;
                    }
                }
                if (rollbackCount > 0) {
                    await rollbackBatch.commit();
                }
            } catch (rollbackErr) {
                console.error("Rollback gagal", rollbackErr);
            }
            alert("Terjadi kesalahan pengiriman. Data telah di-rollback.");
            return;
        }
        
        setMassImportStatusText(`SUKSES! ${kms.length} titik KM selesai 🚀`);
        setTimeout(() => {
            setIsMassImporting(false);
            setMassImportKMList("");
            onClose();
            // Optionally, page reload to reflect changes globally
            window.location.reload();
        }, 2000);
        
    } catch (e: any) {
        console.error(e);
        alert("Gagal: " + e.message);
        setIsMassImporting(false);
        setMassImportStatusText("");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-[2rem] p-6 shadow-xl border border-border/50 my-8 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          ✕
        </button>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold uppercase italic tracking-tighter">Impor Massal (Developer)</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Smart Randomize & Bulk Insert</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Target Tanggal</label>
                 <Input 
                   type="text" 
                   placeholder="Contoh: 23 Mei 2026" 
                   value={massImportDate}
                   onChange={e => setMassImportDate(e.target.value)}
                 />
              </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Folder 0%</label>
                 <Input value={massImportFolder0} onChange={e => setMassImportFolder0(e.target.value)} />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Folder 50%</label>
                 <Input value={massImportFolder50} onChange={e => setMassImportFolder50(e.target.value)} />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Folder 100%</label>
                 <Input value={massImportFolder100} onChange={e => setMassImportFolder100(e.target.value)} />
              </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Daftar Titik KM (Satu per baris)</label>
            <textarea
              disabled={isMassImporting}
              value={massImportKMList}
              onChange={e => setMassImportKMList(e.target.value)}
              className="w-full flex w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[200px]"
              placeholder={"21+800 B/OS\n21+785 B/OS\n21+770 B/OS..."}
            />
          </div>

          <div className="pt-4 flex items-center justify-end">
            <Button
              disabled={isMassImporting || !massImportKMList.trim()}
              onClick={executeMassImport}
              className="w-full sm:w-auto px-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl uppercase tracking-widest font-bold text-xs border-none shadow-none"
            >
              {isMassImporting ? (
                <>
                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                  {massImportStatusText}
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Mulai Proses 
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
