const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Add handleDeleteActivity to the interface
if (!content.includes('handleDeleteActivity: (id: string) => Promise<void>;')) {
    content = content.replace(
        /logActivity: \(activity: Omit<Activity, 'id' \| 'userId' \| 'userEmail' \| 'timestamp'>\) => Promise<void>;/,
        "logActivity: (activity: Omit<Activity, 'id' | 'userId' | 'userEmail' | 'timestamp'>) => Promise<void>;\n  handleDeleteActivity: (id: string) => Promise<void>;"
    );
}

// Add the implementation
if (!content.includes('const handleDeleteActivity')) {
    const impl = `
  const handleDeleteActivity = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'activities', id));
      setActivities(prev => prev.filter(a => a.id !== id));
      addNotification('Berhasil', 'Riwayat aktivitas dihapus.', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Error', 'Gagal menghapus riwayat aktivitas.', 'error');
    }
  };
    `;
    content = content.replace(
        /const logActivity =/,
        impl + "\n  const logActivity ="
    );
}

// Expose it in the value returned
if (!content.includes('handleDeleteActivity,')) {
    content = content.replace(
        /activities, logActivity,/,
        "activities, logActivity, handleDeleteActivity,"
    );
}

fs.writeFileSync('src/context/AppContext.tsx', content);
