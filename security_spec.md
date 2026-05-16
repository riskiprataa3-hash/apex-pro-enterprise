# Security Specification: Toll-Guard Apex pro

## Data Invariants
1. **Identity Integrity**: Setiap dokumen yang memiliki `ownerId` atau `senderId` wajib menyertakan UID user yang sedang login.
2. **Admin Exclusive**: Akses ke `login_logs` hanya diperbolehkan untuk Admin (developmentshaka@gmail.com atau admin.shaka@gmail.com).
3. **Task Ownership**: Hanya Admin yang dapat membuat tugas. Pelaksana hanya dapat memperbarui status tugas yang ditujukan kepadanya.
4. **Project Privacy**: Pelaksana hanya dapat melihat proyek yang mereka buat sendiri (jika diizinkan) atau data yang ditandai untuk mereka. Namun secara sistem, proyek bersifat kolaboratif dengan supervisi Admin.
5. **Immutable Identity**: `senderEmail` dan `senderId` dalam pesan tidak boleh diubah setelah dibuat.
6. **Task Realization**: Pelaksana tidak dapat menandai tugas 'selesai' tanpa menyertakan `realizationPhoto`.

## The "Dirty Dozen" Payloads (Attack Vectors)

1. **Identity Spoofing (Chat)**: Mengirim pesan dengan `senderEmail: "developmentshaka@gmail.com"` padahal login sebagai pelaksana.
2. **Admin Log Hijacking**: User pelaksana mencoba membaca koleksi `login_logs`.
3. **Ghost Projects**: Hacker mencoba membuat proyek dengan `ownerId` milik user lain.
4. **Task Assignment Bypass**: Pelaksana mencoba membuat tugas baru (akses tulis `tasks`).
5. **Unauthorized Task Update**: Pelaksana A mencoba merubah status tugas yang ditugaskan ke Pelaksana B.
6. **Realization Cheat**: Menandai status tugas `completed` tanpa mengirimkan `realizationPhoto`.
7. **Timestamp Poisoning**: Mengirim `timestamp` di masa depan (misal tahun 2030) untuk mengelabui filter.
8. **Shadow Field Injection**: Menambahkan field `isAdmin: true` pada koleksi `chat_messages`.
9. **Project Deletion Attack**: Pelaksana mencoba menghapus proyek (hanya Admin yang boleh).
10. **Notification Spamming**: Mengirim ribuan notifikasi ke user lain secara membabi buta.
11. **PII Leakage**: Mencoba membaca seluruh `chat_messages` tanpa memfilter `receiverEmail`.
12. **Insecure ID injection**: Membuat dokumen dengan ID sejauh 1MB karakter sampah di koleksi `tasks`.

## Verification Strategy
- Aturan Firestore akan divalidasi menggunakan helper `isValid[Entity]` untuk setiap skema.
- Pengecekan `affectedKeys().hasOnly()` akan digunakan pada setiap update status tugas.
- Pembatasan `list` query akan dipaksa melalui aturan `resource.data`.
