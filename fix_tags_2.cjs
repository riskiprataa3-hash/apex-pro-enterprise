const fs = require('fs');
['src/components/DashboardPage.tsx', 'src/components/DevMonitorTab.tsx', 'src/components/ProjectDetailPage.tsx'].forEach(file => {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/<span className="ml-[^>]*>/g, (match) => {
    if (match.includes('ml-2') && !match.includes('</Badge>')) {
      return match.replace('<span', '<Badge');
    }
    return match;
  });
  
  // Actually, wait, the easiest way to solve the mismatch is to just change all `</Badge>` to `</span>` and `<Badge` (if it was acting as span) to `<span`
  // But Badge is a custom component, so it might have logic or missing variants now. 
  
  // Let's just find `</Badge>` and if the opening tag is missing, figure it out? No, let's just make all `</Badge>` into `</span>` if the opening is span...
  
  // Just use regex to restore `<Badge...` where `</Badge>` exists.
  text = text.replace(/<span([^>]*>.*?)<\/Badge>/g, '<Badge$1</Badge>');
  
  // Wait, `.*` doesn't match newlines.
  
  // Let's just restore ALL <span className="ml-2... to <Badge
  text = text.replace(/<span className="ml-2([^>]*)>/g, '<Badge className="ml-2$1>');
  
  // And change `?.equipmentUsed` syntax error in ProjectDetailPage.tsx
  // What is the exact syntax error? TS1109 Expression Expected: `foo?.equipmentUsed`? Ah, maybe it replaced `res.equipmentUsed` with `res?.equipmentUsed` but the regex was `\.equipmentUsed`. So it became `res?.?.equipmentUsed` or `res?.equipmentUsed` instead of `item?.equipmentUsed` where the previous dot was not a dot but part of `item.equipmentUsed` -> `item?.equipmentUsed`.
  // Wait, a period is `.` and in regex `\.`. I did `\.equipmentUsed`. So `item.equipmentUsed` -> `item?.equipmentUsed`. That's valid. Unless it was `equipmentUsed?` no.
  text = text.replace(/entry\?\.\?\.equipmentUsed/g, 'entry?.equipmentUsed');
  text = text.replace(/prev\?\.\?\.equipmentUsed/g, 'prev?.equipmentUsed');
  text = text.replace(/\?\.\?\.equipmentUsed/g, '?.equipmentUsed');

  fs.writeFileSync(file, text);
});
