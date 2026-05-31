export const preloadImageAsBase64 = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000));
  const retry = async <T>(fn: () => Promise<T>, retries: number = 2): Promise<T> => {
    let lastErr: any;
    for (let i = 0; i <= retries; i++) {
        try { const res = await fn(); if (res) return res; } 
        catch (e) { lastErr = e; await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
    }
    return null as any;
  };
  const runLogic = async (): Promise<string | null> => {
    const toB64 = (blob: Blob): Promise<string> => new Promise((resolve) => {
        const reader = new FileReader(); // Note: mock for node? wait, this requires DOM window! 
        // node doesn't have FileReader. Let's just return "WORKS" if blob is fetched.
        resolve("FOUND-BLOB");
    });
    const fetchWithTimeout = async (proxyUrl: string, ms: number = 10000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        try {
            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(id);
            if (response.ok) {
                console.log("Success with proxy:", proxyUrl);
                return "WORKS";
            } else {
                console.log("Status error with proxy:", proxyUrl, response.status);
            }
        } catch (e) { clearTimeout(id); console.log("Fetch error with proxy:", proxyUrl, (e as Error).message); }
        throw new Error('Proxy fetch failed');
    };
    const tryProxy = async (proxyUrl: string) => retry(() => fetchWithTimeout(proxyUrl), 1);
    const proxies = [
      "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&output=jpeg&q=80",
      url, 
      "https://corsproxy.io/?" + encodeURIComponent(url),
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(url)
    ];
    for (const proxyUrl of proxies) {
      try { const result = await tryProxy(proxyUrl); if (result) return result; } catch (e) { continue; }
    }
    return null;
  };
  return Promise.race([runLogic(), timeoutPromise]);
};
const testUrl = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/dokumentasi%20O%25%2FIMG-20260520-WA0014_800x800.jpeg?alt=media&token=1af2ac48-eb9e-4310-a4eb-77eb372ca386";
preloadImageAsBase64(testUrl).then(res => { console.log("Final outcome:", res); });
