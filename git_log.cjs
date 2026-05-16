const { execSync } = require('child_process');
try {
  console.log(execSync('git log -p firebase-applet-config.json | head -n 400').toString());
} catch(e) {
  console.log(e.message);
}
