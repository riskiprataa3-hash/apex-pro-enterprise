export function getRantingClass(kmVal: string | undefined | null): string {
    const kmStr = (kmVal || '').toUpperCase();
    if (!kmStr) return '';

    if (kmStr.includes('KANDIS SELATAN')) return 'Ranting 1';

    const match = kmStr.match(/(?:KM\s*)?0*(\d{1,2})\+(\d{1,3})/);
    if (match) {
        const km = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const isAOS = kmStr.includes('A/OS');
        const isBOS = kmStr.includes('B/OS');
        
        // Ranting 2 rules
        if (isBOS) {
            // 74+800 (There are 74+805, 74+810)
            if (km === 74 && m >= 790 && m <= 810) return 'Ranting 2';
            // 60+200 sd 61+420
            if (
               (km === 60 && m >= 200) || 
               (km === 61 && m <= 420)
            ) return 'Ranting 2';
            // 55+610
            if (km === 55 && m >= 600 && m <= 620) return 'Ranting 2';
            // 55+150
            if (km === 55 && m >= 140 && m <= 160) return 'Ranting 2';
            // 44+000 sd 44+400
            if (km === 44 && m >= 0 && m <= 400) return 'Ranting 2';
        }
        if (isAOS) {
            // 44+000 sd 44+400
            if (km === 44 && m >= 0 && m <= 400) return 'Ranting 2';
            // 54+970 sd 55+630
            if (
               (km === 54 && m >= 970) || 
               (km === 55 && m <= 630)
            ) return 'Ranting 2';
            // 60+300 sd 61+400
            if (
               (km === 60 && m >= 300) || 
               (km === 61 && m <= 400)
            ) return 'Ranting 2';
            // 74+400 sd 75+000
            if (
               (km === 74 && m >= 400) || 
               (km === 75 && m === 0)
            ) return 'Ranting 2';
        }
        
        // Ranting 1 rules
        if (isAOS) {
            // 08+000
            if (km === 8 && m === 0) return 'Ranting 1';
            // 08+600
            if (km === 8 && m === 600) return 'Ranting 1';
            // 08+800 sd 09+300
            if (
               (km === 8 && m >= 800 && m <= 999) || 
               (km === 9 && m <= 300)
            ) return 'Ranting 1';
        }
        if (isBOS) {
            // 12+200
            if (km === 12 && m === 200) return 'Ranting 1';
            // 08+000
            if (km === 8 && m === 0) return 'Ranting 1';
        }
    }
    
    return 'Ranting 3';
}
