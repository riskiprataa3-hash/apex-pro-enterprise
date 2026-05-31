import React, { useState, useEffect } from 'react';
import { storage } from '../firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export const FirebaseImage = ({ url, ...props }: { url: string } & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [src, setSrc] = useState<string>('');
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setRetryCount(0);
    setError(false);
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

  const handleError = () => {
    if (retryCount === 0 && src.includes('firebasestorage') && !src.includes('_800x800')) {
       // Firebase extension might have resized and deleted the original file. Try _800x800 fallback
       const resizedUrl = src.replace(/\.(jpeg|jpg|png|webp)(?=\?|$)/i, '_800x800.$1');
       if (resizedUrl !== src) {
          setRetryCount(1);
          setSrc(resizedUrl);
          return;
       }
    }
    setError(true);
  };

  if (error) {
     return <div className={`bg-rose-500/10 flex items-center justify-center text-[8px] text-rose-500 font-bold p-2 text-center leading-tight ${props.className || ''}`}>Gagal<br/>Muat</div>;
  }
  
  if (!src) {
     return <div className={`bg-muted/40 animate-pulse flex items-center justify-center ${props.className || ''}`} />;
  }
  
  return <img src={src} onError={handleError} {...props} />;
};
