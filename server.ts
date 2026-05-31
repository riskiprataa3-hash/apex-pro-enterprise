import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { dataSnippet, totalEntries } = req.body;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY || '',
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Analisis data progres proyek infrastruktur berikut:
Total Entry: ${totalEntries}
Data (10 terakhir): ${JSON.stringify(dataSnippet)}

Berikan ringkasan sangat singkat (max 3 kalimat) dalam Bahasa Indonesia mengenai status saat ini dan apa yang perlu diperhatikan.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (e: any) {
      console.error("AI Error:", e);
      res.status(500).json({ error: e.message || "Failed to generate text" });
    }
  });

  app.get("/api/proxy", async (req, res) => {
    try {
      const url = req.query.url as string;
      if (!url) {
        res.status(400).send("No url provided");
        return;
      }
      const response = await fetch(url);
      if (!response.ok) {
        res.status(response.status).send(response.statusText);
        return;
      }
      res.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cache-Control", "public, max-age=31536000");
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (e: any) {
      console.error("Proxy error", e);
      res.status(500).send(e.message);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Provide SPA fallback for all routes
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
