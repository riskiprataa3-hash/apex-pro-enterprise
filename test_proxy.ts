import { readFileSync, writeFileSync } from 'fs';

async function testFetch() {
    const url = 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/dokumentasi%20O%25%2FIMG_20260515_093939_861.jpg?alt=media&token=d61610e3-511a-40a0-b272-b12f6536c9be';
    
    // proxy URL
    const proxyUrl = "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&w=640&h=480&fit=inside&output=jpg&q=60";
    
    try {
        const response = await fetch(proxyUrl);
        console.log('wsrv status:', response.status);
        if (response.ok) {
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const b64 = Buffer.from(arrayBuffer).toString('base64');
            const dataUrl = `data:${blob.type};base64,${b64}`;
            console.log('Success, data URL length:', dataUrl.length);
            console.log('Starts with:', dataUrl.substring(0, 50));
        } else {
            console.log('wsrv failed', await response.text());
        }
    } catch (e) {
        console.error('proxy error', e);
    }
}

testFetch();
