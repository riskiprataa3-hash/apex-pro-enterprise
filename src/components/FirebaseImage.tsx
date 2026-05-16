import { useState, useEffect } from 'react';
import { storage } from '../firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export const FirebaseImage = ({ url, ...props }: { url: string } & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [src, setSrc] = useState<string>('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
       setSrc('');
       return;
    }
    if (url.startsWith('http') || url.startsWith('data:')) {
      setSrc(url);
      return;
    }
    
    // Attempt to handle gs:// or relative paths
    const fetchUrl = async () => {
      try {
        let path = url;
        if (path.startsWith('gs://')) {
          const parts = path.replace('gs://', '').split('/');
          parts.shift(); // remove bucket
          path = parts.join('/');
        }
        
        let decodedPath = path;
        try { decodedPath = decodeURIComponent(path); } catch(e) {}
        
        const resolved = await getDownloadURL(ref(storage, decodedPath));
        setSrc(resolved);
      } catch (e) {
        console.warn("Failed to resolve Firebase image", url, e);
        setError(true);
      }
    };
    fetchUrl();
  }, [url]);

  if (error) {
     return <div className={`bg-rose-500/10 flex items-center justify-center text-[8px] text-rose-500 font-bold p-2 text-center leading-tight ${props.className || ''}`}>Gagal<br/>Muat</div>;
  }
  
  if (!src) {
     return <div className={`bg-muted/40 animate-pulse flex items-center justify-center ${props.className || ''}`} />;
  }
  
  return <img src={src} {...props} />;
};
