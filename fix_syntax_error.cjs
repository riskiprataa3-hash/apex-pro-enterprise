const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

// The faulty string created:
// 2541-              </button>
// 2542-            )
// 2543-            {!isClient && (

content = content.replace(/<\/button>\s*\)\s*\{!isClient && \(/, "</button>\n            )}\n            {!isClient && (");
content = content.replace(/<\/button>\s*\}\s*\{\!isClient/, "</button>\n            )}\n            {!isClient");

// Oh wait, there is a stray } at 2549
content = content.replace(/<\/button>\s*\)\}\s*\}/, "</button>\n            )}");

fs.writeFileSync('src/components/DashboardPage.tsx', content);
