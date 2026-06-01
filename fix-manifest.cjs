const fs = require('fs');
const json = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));

// Fix icons
json.icons.forEach(i => {
  if (!i.src.startsWith('/')) i.src = '/' + i.src;
});

// Fix shortcuts
if (json.shortcuts) {
  json.shortcuts.forEach(s => {
    if (s.icons) {
      s.icons.forEach(i => {
        if (!i.src.startsWith('/')) i.src = '/' + i.src;
      });
    }
  });
}

// Fix screenshots
if (json.screenshots) {
  json.screenshots.forEach(s => {
    if (!s.src.startsWith('/')) s.src = '/' + s.src;
  });
}

// Add scope_extensions
json.scope_extensions = [
  { 'origin': '*.run.app' },
  { 'origin': '*.web.app' },
  { 'origin': '*.firebaseapp.com' }
];

// Add file_handlers
json.file_handlers = [
  {
    'action': '/',
    'accept': {
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  }
];

fs.writeFileSync('public/manifest.json', JSON.stringify(json, null, 2));
