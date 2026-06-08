export function getRantingClass(kmVal: string | undefined | null): string {
    const kmStr = (kmVal || '').toUpperCase().trim();
    if (!kmStr) return 'Ranting 3';

    // Treat Kandis Selatan or Akses Keluar Kandis Selatan as Ranting 1
    if (kmStr.includes('KANDIS SELATAN') || kmStr.includes('KANDIS') || kmStr.includes('AKSES KELUAR')) {
        return 'Ranting 1';
    }

    // Support common formats: "74+800", "74,800", "74.800", "74 - 800", "74 800", etc.
    const matchWithMeters = kmStr.match(/(?:(?:KM|STA)\s*)?(\d{1,3})\s*[\+\-\.,\s]\s*(\d{1,3})/);
    let km = 0;
    let m = 0;
    let hasMatch = false;

    if (matchWithMeters) {
        km = parseInt(matchWithMeters[1], 10);
        m = parseInt(matchWithMeters[2], 10);
        hasMatch = true;
    } else {
        const matchKmOnly = kmStr.match(/(?:(?:KM|STA)\s*)?(\d{1,3})/);
        if (matchKmOnly) {
            km = parseInt(matchKmOnly[1], 10);
            m = 0;
            hasMatch = true;
        }
    }

    if (hasMatch) {
        // Direct directions checking for A/IS, B/IS, JALAN MASUK, which explicitly go to Ranting 3
        const isAIS = kmStr.includes('A/IS') || kmStr.includes('AIS') || kmStr.includes('A-IS');
        const isBIS = kmStr.includes('B/IS') || kmStr.includes('BIS') || kmStr.includes('B-IS');
        const isJalanMasuk = kmStr.includes('JALAN MASUK') || kmStr.includes('MASUK');

        if (isAIS || isBIS || isJalanMasuk) {
            return 'Ranting 3';
        }

        // Determine AOS and BOS
        const isBOS = kmStr.includes('B/OS') || 
                      kmStr.includes('BOS') || 
                      kmStr.includes('B-OS') || 
                      kmStr.includes('B / OS') ||
                      kmStr.endsWith(' B') || 
                      kmStr.endsWith('B/OS') || 
                      kmStr.endsWith('BOS') ||
                      /\bB\b/.test(kmStr);
                      
        const isAOS = kmStr.includes('A/OS') || 
                      kmStr.includes('AOS') || 
                      kmStr.includes('A-OS') || 
                      kmStr.includes('A / OS') ||
                      kmStr.endsWith(' A') || 
                      kmStr.endsWith('A/OS') || 
                      kmStr.endsWith('AOS') ||
                      /\bA\b/.test(kmStr) ||
                      (!isBOS);

        // 1. RANTING 1
        // A/OS: 08+000 (1 titik), 08+600 (1 titik), 08+800 sd 09+300 (6 titik)
        if (isAOS) {
            if (km === 8 && m === 0) return 'Ranting 1';
            if (km === 8 && m === 600) return 'Ranting 1';
            if ((km === 8 && m >= 800 && m <= 999) || (km === 9 && m >= 0 && m <= 300)) {
                return 'Ranting 1';
            }
        }
        // B/OS: 12+200 (1 titik), 08+000 (2 titik)
        if (isBOS) {
            if (km === 12 && m === 200) return 'Ranting 1';
            if (km === 8 && m === 0) return 'Ranting 1';
        }

        // 2. RANTING 2 (Terkunci secara eksklusif)
        // B/OS (50 titik):
        // - 74+800 (2 titik)
        // - 61+400 sd 60+200 (35 titik) -> STA 60+200 sd 61+400
        // - 55+610 (1 titik)
        // - 55+150 (1 titik)
        // - 44+400 sd 44+000 (11 titik) -> STA 44+000 sd 44+400
        if (isBOS) {
            if (km === 74 && m === 800) return 'Ranting 2';
            if ((km === 60 && m >= 200 && m <= 999) || (km === 61 && m >= 0 && m <= 400)) return 'Ranting 2';
            if (km === 55 && m === 610) return 'Ranting 2';
            if (km === 55 && m === 150) return 'Ranting 2';
            if (km === 44 && m >= 0 && m <= 400) return 'Ranting 2';
        }

        // A/OS (117 titik):
        // - 44+000 sd 44+400 (17 titik)
        // - 54+980 sd 55+600 (17 titik)
        // - 60+300 sd 61+400 (40 titik)
        // - 74+400 sd 75+000 (43 titik)
        if (isAOS) {
            if (km === 44 && m >= 0 && m <= 400) return 'Ranting 2';
            if ((km === 54 && m >= 980 && m <= 999) || (km === 55 && m >= 0 && m <= 600)) return 'Ranting 2';
            if ((km === 60 && m >= 300 && m <= 999) || (km === 61 && m >= 0 && m <= 400)) return 'Ranting 2';
            if ((km === 74 && m >= 400 && m <= 999) || (km === 75 && m === 0)) return 'Ranting 2';
        }
    }

    return 'Ranting 3';
}
