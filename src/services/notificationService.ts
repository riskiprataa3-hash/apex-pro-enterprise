import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// This is a mockup for SMS Gateway & Email Notification Services.
// In a real production environment, you would call a backend function 
// (e.g., Firebase Cloud Functions, or an external API like Twilio/SendGrid)
// to prevent exposing API keys on the frontend.

/**
 * MOCK: Send SMS Notification using an SMS Gateway
 * In real usage, you'd integrate with platforms like Twilio, Nexmo, atau layanan lokas SMS gateway.
 */
export const sendSMSNotification = async (phoneNumber: string, message: string) => {
  console.log(`[SMS Gateway] Mengirim pesan ke ${phoneNumber}:`);
  console.log(`Pesan: "${message}"`);
  
  // Real implementation example:
  /*
  const response = await fetch("https://api.smsgateway.example/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.SMS_API_KEY}` },
    body: JSON.stringify({ to: phoneNumber, text: message })
  });
  if (!response.ok) throw new Error("Gagal mengirim SMS");
  */
  
  return true;
};

/**
 * MOCK: Send Email Notification
 * In real usage, you'd integrate with SendGrid, Resend, or Firebase Trigger Email extension.
 */
export const sendEmailNotification = async (toEmail: string, subject: string, htmlContent: string) => {
  console.log(`[Email Service] Mengirim email ke ${toEmail}:`);
  console.log(`Subject: "${subject}"`);
  console.log(`Content: "${htmlContent}"`);
  
  // Real implementation example:
  /*
  const response = await fetch("https://api.emailservice.example/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.EMAIL_API_KEY}` },
    body: JSON.stringify({ to: toEmail, subject, html: htmlContent })
  });
  if (!response.ok) throw new Error("Gagal mengirim Email");
  */
  
  return true;
};

/**
 * Helper to fetch Admin emails
 */
export const getAdminEmails = async (): Promise<string[]> => {
  try {
    const q = query(collection(db, "workers"), where("role", "==", "admin"));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data().email).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch admin emails:", error);
    return [];
  }
};

/**
 * Notify Executant (Pelaksana) via SMS about Task Update
 */
export const notifyTaskUpdateToExecutant = async (taskTitle: string, status: string, assignedToEmail: string) => {
  try {
     // Fetch the user's phone number based on email (assuming workers collection has it)
     const q = query(collection(db, "workers"), where("email", "==", assignedToEmail));
     const snap = await getDocs(q);
     if (!snap.empty) {
       const worker = snap.docs[0].data();
       if (worker.phone) {
         await sendSMSNotification(
           worker.phone,
           `[Shaka KYY] Update Tugas: "${taskTitle}" status sekarang adalah: ${status}. Harap perhatikan instruksi mendesak jika ada.`
         );
       } else {
         console.warn("Pelaksana tidak memiliki nomor telepon terdaftar.");
       }
     }
  } catch (error) {
     console.error("Failed to send task update SMS", error);
  }
};

/**
 * Notify Admins via Email for Critical Incidents
 */
export const notifyAdminsForNewIncident = async (incidentDesc: string, reporterEmail: string, location: {lat: number, lng: number} | null) => {
  try {
     const admins = await getAdminEmails();
     
     const subject = `[URGENT] Laporan Insiden Baru oleh ${reporterEmail}`;
     const htmlContent = `
       <h2>Laporan Insiden Baru</h2>
       <p><strong>Dilaporkan oleh:</strong> ${reporterEmail}</p>
       <p><strong>Deskripsi:</strong> ${incidentDesc}</p>
       <p><strong>Lokasi:</strong> ${location ? `${location.lat}, ${location.lng}` : "Tidak diketahui"}</p>
     `;
     
     for (const admin of admins) {
       await sendEmailNotification(admin, subject, htmlContent);
     }
  } catch (error) {
     console.error("Failed to send incident email to admins", error);
  }
};

/**
 * Notify Admins via Email for Critical Material/Equipment Requests
 */
export const notifyAdminsForEquipmentRequest = async (toolName: string, desc: string, reporterEmail: string) => {
  try {
     const admins = await getAdminEmails();
     
     const subject = `[PERMINTAAN ALAT] Permintaan Baru oleh ${reporterEmail}`;
     const htmlContent = `
       <h2>Permintaan Alat Baru / Perbaikan</h2>
       <p><strong>Dilaporkan oleh:</strong> ${reporterEmail}</p>
       <p><strong>Alat:</strong> ${toolName}</p>
       <p><strong>Keterangan:</strong> ${desc}</p>
     `;
     
     for (const admin of admins) {
       await sendEmailNotification(admin, subject, htmlContent);
     }
  } catch (error) {
     console.error("Failed to send equipment request email to admins", error);
  }
};
