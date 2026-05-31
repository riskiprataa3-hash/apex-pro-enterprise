import fs from 'fs';
['public/logo192.png', 'public/logo512.png', 'public/pwa-64x64.png', 'public/maskable-icon-512x512.png'].forEach(f => {
  const stat = fs.statSync(f);
  console.log(f, stat.size);
});
