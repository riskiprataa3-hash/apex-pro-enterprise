import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

// Baca konfigurasi dari firebase-applet-config.json
const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function generateReport() {
    console.log("Mempersiapkan penambahan entri harian tanggal 15 Mei 2026...");
    await signInWithEmailAndPassword(auth, 'developmentshaka@gmail.com', 'Riski1310');
    console.log("Berhasil login!");

    // Tentukan waktu ke 15 Mei 2026 (WIB: +7 jam jadi kita set tengah hari)
    const targetDate = new Date("2026-05-15T12:00:00+07:00");
    const timestamp15Mei = targetDate.getTime();
    
    // Ambil project pertama untuk memasukkan laporan (kalau ada)
    const projectsSnap = await getDocs(collection(db, "projects"));
    if (projectsSnap.empty) {
        console.error("Tidak ada data proyek di database untuk menambahkan entri.");
        process.exit(1);
    }
    
    // Gunakan project pertama
    const project = projectsSnap.docs[0];
    const pId = project.id;
    console.log(`Menggunakan proyek: ${project.data().name || project.id}`);

    // Data sampel laporan pemasangan
    const laporanBaru = [
        { km: "25+100", side: "A", desc: "Pekerjaan aspal lapis pertama KM 25+100 A", type: "asphalt" },
        { km: "25+300", side: "B", desc: "Perbaikan marka jalan KM 25+300 B", type: "marka" }
    ];

    const placeholderPhotos = [
        "https://images.unsplash.com/photo-1541888946425-d81bb19480c5",
        "https://images.unsplash.com/photo-1590486803833-ffc4571713df"
    ];

    console.log(`Memproses ${laporanBaru.length} data laporan baru...`);

    for (const item of laporanBaru) {
        const data = {
            km: `KM ${item.km} ${item.side}`,
            type: item.type,
            category: item.type.toUpperCase(),
            description: item.desc,
            status: "completed",
            timestamp: timestamp15Mei, // 15 Mei 2026
            createdDay: targetDate.toLocaleDateString("id-ID"),
            serverTimestamp: new Date(), // Firebase SDK tak support serverTimestamp() di skrip non-admin kadang, pakai JS date
            userEmail: "system_script@bumn.co.id",
            ownerId: "SYSTEM_REPORT", 
            photos0: [placeholderPhotos[0]],
            photos50: [placeholderPhotos[1]],
            photos100: [placeholderPhotos[0]],
            qty: 1,
            unit: "LOKASI"
        };

        try {
            const docRef = await addDoc(collection(db, "projects", pId, "entries"), data);
            console.log(`[BERHASIL] Entri ${data.km} terinput untuk tanggal 15 Mei 2026. ID: ${docRef.id}`);
        } catch (e: any) {
            console.error(`[GAGAL] ${data.km}: ${e.message}`);
        }
    }

    console.log("Input laporan harian 15 Mei 2026 selesai!");
    process.exit(0);
}

generateReport();
