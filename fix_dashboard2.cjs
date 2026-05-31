const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardPage.tsx', 'utf8');

code = code.replace(/<img src=\{___ className="w-full h-32 object-cover rounded-2xl border border-border shadow-sm" alt="Evidence" \/>/, '<FirebaseImage url={req.photo} className="w-full h-32 object-cover rounded-2xl border border-border shadow-sm" alt="Evidence" />');

code = code.replace(/<img src=\{___ alt="APD" className="w-full h-full object-cover" \/>/, '<FirebaseImage url={apd.photo} alt="APD" className="w-full h-full object-cover" />');

code = code.replace(/<img src=\{___ className="w-full h-full object-cover rounded-2xl" alt="K3 Proof" \/>/, '<FirebaseImage url={hsePhoto} className="w-full h-full object-cover rounded-2xl" alt="K3 Proof" />');

code = code.replace(/<img src=\{___ alt="APD Proof" className="w-full h-full object-cover" \/>/, '<FirebaseImage url={apdPhoto} alt="APD Proof" className="w-full h-full object-cover" />');

code = code.replace(/<img src=\{___ className="w-full h-full object-cover rounded-2xl" alt="Incident" \/>/, '<FirebaseImage url={incPhoto} className="w-full h-full object-cover rounded-2xl" alt="Incident" />');

code = code.replace(/<img src=\{___ className="w-full h-full object-cover" alt="Fuel Proof" \/>/, '<FirebaseImage url={fuelPhoto} className="w-full h-full object-cover" alt="Fuel Proof" />');

code = code.replace(/<img src=\{___ className="w-full h-full object-cover rounded-2xl" alt="Eq Proof" \/>/, '<FirebaseImage url={eqPhoto} className="w-full h-full object-cover rounded-2xl" alt="Eq Proof" />');

let pCount = 0;
// Note: we have two replacements for identical classNames
code = code.replace(/<img src=\{___ className="w-full h-full object-cover" referrerPolicy="no-referrer" \/>/g, () => {
    pCount++;
    return pCount === 1 ? '<FirebaseImage url={task.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />' : '<FirebaseImage url={p} className="w-full h-full object-cover" referrerPolicy="no-referrer" />';
});

code = code.replace(/<img src=\{___ className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" \/>/g, '<FirebaseImage url={p} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />');

code = code.replace(/m.photo && <img src=\{___ className="w-full rounded-2xl mb-4 border border-black\/5" referrerPolicy="no-referrer" \/>/g, 'm.photo && <FirebaseImage url={m.photo} className="w-full rounded-2xl mb-4 border border-black/5" referrerPolicy="no-referrer" />');

code = code.replace(/<img src=\{___ className="w-12 h-12 rounded-lg object-cover" \/>/g, '<FirebaseImage url={msgPhoto} className="w-12 h-12 rounded-lg object-cover" />');

fs.writeFileSync('src/components/DashboardPage.tsx', code);
