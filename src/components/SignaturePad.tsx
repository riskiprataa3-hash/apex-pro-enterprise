import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RefreshCcw } from 'lucide-react';
import { Button } from './ui/Base';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
  signatureDataUrl?: string; // initial
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear, signatureDataUrl }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    onClear();
  };

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      onSave(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));
    } else {
      onSave(''); // Emptied
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 relative">
       <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden touch-none relative h-40">
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              className: 'w-full h-full'
            }}
            onEnd={save}
          />
          {signatureDataUrl && (
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-cover bg-center" style={{ backgroundImage: `url(${signatureDataUrl})` }} />
          )}
       </div>
       <div className="flex justify-between items-center px-1">
         <span className="text-xs text-slate-500 italic">Tanda tangan di kotak atas</span>
         <button onClick={(e) => { e.preventDefault(); clear(); }} className="text-xs text-rose-500 flex items-center gap-1 font-bold">
            <RefreshCcw className="w-3 h-3" /> Ulangi
         </button>
       </div>
    </div>
  );
};
