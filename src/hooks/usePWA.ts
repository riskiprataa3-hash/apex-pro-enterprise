import { useState, useEffect } from 'react';

// Global state to store the prompt event
let globalInstallPrompt: any = null;
let globalIsInstallable = false;
let globalIsInstalled = false;
let listeners: Function[] = [];

const notifyListeners = () => {
  listeners.forEach((l) => l());
};

// Check if already installed
if (typeof window !== 'undefined') {
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  ) {
    globalIsInstalled = true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Prevent standard prompt
    globalInstallPrompt = e;
    globalIsInstallable = true;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalIsInstalled = true;
    globalIsInstallable = false;
    globalInstallPrompt = null;
    notifyListeners();
    console.log('CPM PWA: App was successfully installed');
  });
}

export function usePWA() {
  const [installable, setInstallable] = useState(globalIsInstallable);
  const [installed, setInstalled] = useState(globalIsInstalled);

  useEffect(() => {
    // Sync state on mount and subscribe to changes
    setInstallable(globalIsInstallable);
    setInstalled(globalIsInstalled);

    const update = () => {
      setInstallable(globalIsInstallable);
      setInstalled(globalIsInstalled);
    };

    listeners.push(update);
    return () => {
      listeners = listeners.filter((l) => l !== update);
    };
  }, []);

  const triggerInstall = async () => {
    if (!globalInstallPrompt) {
      console.warn("CPM PWA: No install prompt available");
      return false;
    }
    try {
      globalInstallPrompt.prompt();
      const { outcome } = await globalInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        globalInstallPrompt = null;
        globalIsInstallable = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      console.error("CPM PWA: Error during prompt:", e);
    }
    return false;
  };

  return { isInstallable: installable, isInstalled: installed, triggerInstall };
}
