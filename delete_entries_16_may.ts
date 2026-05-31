import { initializeApp } from "firebase/app";
import { getFirestore, collectionGroup, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

// Baca konfigurasi dari firebase-applet-config.json
const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function deleteEntries() {
    console.log("Mempersiapkan penghapusan entri harian tanggal 16 Mei 2026...");
    try {
        await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
        console.log("Berhasil login!");
    } catch (e: any) {
        console.error("Gagal login:", e.message);
        process.exit(1);
    }

    // Tentukan range waktu untuk 16 Mei 2026 (UTC)
    const dateStr = "2026-05-16";
    const start = new Date(dateStr).getTime();
    const end = start + 86400000;
    
    console.log(`Mencari data dari timestamp ${start} sampai ${end}...`);

    const q = query(
        collectionGroup(db, 'entries'),
        where('timestamp', '>=', start),
        where('timestamp', '<', end)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        console.log(`Tidak ditemukan data pada tanggal ${dateStr}.`);
        process.exit(0);
    }

    console.log(`Ditemukan ${snapshot.size} data. Sedang menghapus...`);

    let count = 0;
    for (const d of snapshot.docs) {
        try {
            await deleteDoc(d.ref);
            count++;
            if (count % 10 === 0) console.log(`Dihapus ${count}/${snapshot.size}...`);
        } catch (e: any) {
            console.error(`Gagal menghapus dokumen ${d.id}:`, e.message);
        }
    }

    console.log(`Penghapusan selesai. Total ${count} dokumen dihapus.`);
    process.exit(0);
}

deleteEntries();
