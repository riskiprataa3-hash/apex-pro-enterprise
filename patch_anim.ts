import fs from 'fs';
import path from 'path';

function walkDir(dir: string, callback: (path: string) => void) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/components', (file) => {
  if (file.endsWith('.tsx')) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Change framer motion 
    if (content.includes('y: 20')) {
      content = content.replace(/y: 20/g, 'y: 10');
      changed = true;
    }
    if (content.includes('y: -20')) {
      content = content.replace(/y: -20/g, 'y: -10');
      changed = true;
    }
    if (content.includes('x: 20')) {
      content = content.replace(/x: 20/g, 'x: 10');
      changed = true;
    }
    if (content.includes('x: -20')) {
      content = content.replace(/x: -20/g, 'x: -10');
      changed = true;
    }
    
    // change Tailwind animate-in
    if (content.match(/slide-in-from-bottom-[0-9]+/)) {
      content = content.replace(/slide-in-from-bottom-[0-9]+/g, 'slide-in-from-bottom-2');
      changed = true;
    }
    
    // speed up duration
    if (content.match(/duration-[0-9]+/)) {
      content = content.replace(/duration-700/g, 'duration-500');
      content = content.replace(/duration-1000/g, 'duration-700');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content);
    }
  }
});

console.log('Animation simplified');
