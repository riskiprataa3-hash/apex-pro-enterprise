const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/stiffness:\s*\d+/g, 'stiffness: 800');
    content = content.replace(/damping:\s*\d+/g, 'damping: 40');
    content = content.replace(/duration:\s*0\.[2345]5?/g, 'duration: 0.1');
    content = content.replace(/ease:\s*"easeOut"/g, 'ease: [0.25, 1, 0.5, 1]');
    content = content.replace(/ease:\s*"easeInOut"/g, 'ease: [0.25, 1, 0.5, 1]');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
