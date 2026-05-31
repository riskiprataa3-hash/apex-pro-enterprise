const fs = require('fs');

const fixAppCtx = () => {
    const fn = 'src/context/AppContext.tsx';
    let text = fs.readFileSync(fn, 'utf8');
    text = text.replace(/logActivity, handleCreateCashAdvance/, "logActivity, handleDeleteActivity, handleCreateCashAdvance");
    fs.writeFileSync(fn, text);
};

const fixDash = () => {
    const fn = 'src/components/DashboardPage.tsx';
    let text = fs.readFileSync(fn, 'utf8');
    // DashboardPage destructuring `useApp()`
    if (!text.includes('handleDeleteActivity')) {
        text = text.replace(/activities,/, "activities,\n    handleDeleteActivity,");
    }
    fs.writeFileSync(fn, text);
};

fixAppCtx();
fixDash();
