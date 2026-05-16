import fs from 'fs';
import { jsPDF } from 'jspdf';

async function run() {
  const url = 'https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0223554772.firebasestorage.app/o/dokumentasi%20O%25%2FIMG_20260515_093939_861.jpg?alt=media&token=d61610e3-511a-40a0-b272-b12f6536c9be';
  const proxyUrl = "https://wsrv.nl/?url=" + encodeURIComponent(url) + "&w=640&h=480&fit=inside&output=jpg&q=60";
  const r = await fetch(proxyUrl);
  const buffer = await r.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const actualImg = 'data:image/jpeg;base64,' + base64;
  
  const doc = new jsPDF();
  doc.addImage(actualImg, 'JPEG', 10, 10, 100, 100);
  fs.writeFileSync('out.pdf', Buffer.from(doc.output('arraybuffer')));
  console.log('saved out.pdf', actualImg.substring(0, 50));
}
run();
