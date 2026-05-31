# Penjelasan Aplikasi

Aplikasi "Apex Pro CPM" ini merupakan platform manajemen lapangan (Construction/Project Management) untuk memonitor progres kerja harian, khususnya pemeliharaan jalan tol (seperti proyek Pekanbaru-Dumai).

**Fitur Utama & Alur Kerja:**
1. **Manajemen Proyek (Projects):** Pembuatan dan pengaturan proyek (contohnya inlet tol, marka jalan, dll), dengan target volume/kuantitas harian dan target keseluruhan.
2. **Titik Lokasi (Lajur & KM):** Pekerja log hasil kerja harian berdasarkan Kilometer (KM) dan Jalur, yang mencakup baik jalur **A/OS** maupun **B/OS**. Data ini mencatat tonase, volume, waktu, serta lokasi secara spesifik.
3. **Absensi & Geofence:** Mengawasi kehadiran pekerja, mencakup integrasi Face API (deteksi wajah) dan Geofence (verifikasi apakah pekerja berada dalam radius valid lokasi tugas).
4. **HSE & Tasks:** Modul Kesehatan, Keselamatan Kerja dan Lingkungan (HSE) beserta daftar tugas (to-do list/tasks) untuk tim lapangan.
5. **Aktivitas & Riwayat Laporan (Audit):** Semua input harian menghasilkan entri aktivitas. Terdapat fitur auto-generate PDF untuk membuat Laporan Harian (Daily Progress Report) beserta foto bukti lapangan (Before/Progress/After).
6. **Peran Akses (Role):**
   - **Super Admin (Developer):** Akses penuh ke semua proyek, memanajemen data mentah, dan memonitor aktivitas seluruh sistem (DevMonitor).
   - **Admin:** Memanajemen proyek, menyetujui absensi, mengelola geofence.
   - **Pelaksana (Pekerja):** Entry progress harian, melakukan absen, mengupload foto.

*(Catatan diperbarui: Memasukkan penjelasan eksplisit mengenai pengaturan titik KM baik untuk Jalur A/OS dan B/OS yang sama-sama terintegrasi penuh).*
