import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';

// Attempt to globally lock screen orientation to portrait
if (typeof screen !== 'undefined' && screen.orientation && (screen.orientation as any).lock) {
   (screen.orientation as any).lock('portrait').catch((err: any) => {
       console.log('Screen orientation lock failed or not supported:', err);
   });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
