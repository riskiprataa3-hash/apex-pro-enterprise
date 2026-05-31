const fs = require('fs');

const fixDash = () => {
    const file = 'src/components/DashboardPage.tsx';
    let text = fs.readFileSync(file, 'utf8');
    text = text.replace(/hideText={hideText}/g, '');
    text = text.replace(/<ApexLogo className="w-24 h-\[60px\] text-zinc-400 opacity-20" \/>/g, '<ApexLogo className="w-24 h-[60px] text-zinc-400 opacity-20" hideText />');
    
    // fix line 1542 variant
    text = text.replace(/variant={activeTab === 'audit' \? 'default' : 'outline'}/g, 'variant={activeTab === \'audit\' ? \'primary\' : \'outline\'}');
    text = text.replace(/variant={activeTab === 'profile' \? 'default' : 'outline'}/g, 'variant={activeTab === \'profile\' ? \'primary\' : \'outline\'}');
    text = text.replace(/const handleDeleteEntry = \(id\) =>/g, "const handleDeleteEntry = (id: any) =>");
    text = text.replace(/onClick=\{\(e\) => \{/g, "onClick={(e: any) => {");
    
    fs.writeFileSync(file, text);
}

const fixDev = () => {
    let t = fs.readFileSync('src/components/DevMonitorTab.tsx', 'utf8');
    if (!t.includes('import { Badge }')) {
        t = "import { Badge } from './ui/Base';\n" + t;
    }
    fs.writeFileSync('src/components/DevMonitorTab.tsx', t);
}

const fixProj = () => {
    let t = fs.readFileSync('src/components/ProjectDetailPage.tsx', 'utf8');
    t = t.replace(/onClick=\{handleApprove\}/g, "onClick={() => handleApprove()}");
    t = t.replace(/setAiAnalysis\(\(prev: any\) => prev \+ curr\);/g, "setAiAnalysis((prev: any) => prev + String(curr));");
    t = t.replace(/\.equipmentUsed/g, "?.equipmentUsed");
    fs.writeFileSync('src/components/ProjectDetailPage.tsx', t);
}

const fixCtx = () => {
    let t = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
    t = t.replace(/err instanceof Error \? err\.message : 'Unknown error'/g, "(err as any)?.message || 'Unknown error'");
    t = t.replace(/docData\.region \|\| null/g, "docData.region || undefined");
    t = t.replace(/eachCell\(\(c\)/g, "eachCell((c: any)");
    
    fs.writeFileSync('src/context/AppContext.tsx', t);
}

try { fixDash(); } catch(e){}
try { fixDev(); } catch(e){}
try { fixProj(); } catch(e){}
try { fixCtx(); } catch(e){}

