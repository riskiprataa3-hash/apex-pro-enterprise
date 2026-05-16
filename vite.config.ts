import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: "com.tollguard.apexpro.enterprise.v4",
          short_name: "Apex Pro",
          name: "Apex Pro Authorized Ops",
          description: "Sistem Manajemen Lapangan Enterprise untuk Otorisasi Operasional.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          theme_color: "#000000",
          background_color: "#ffffff",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any"
            },
            {
              src: "/maskable-icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ],
          screenshots: [
            {
              src: "/screenshot-wide.svg",
              sizes: "1280x720",
              type: "image/svg+xml",
              form_factor: "wide",
              label: "Apex Pro Dashboard"
            },
            {
              src: "/screenshot-narrow.svg",
              sizes: "720x1280",
              type: "image/svg+xml",
              form_factor: "narrow",
              label: "Apex Pro Mobile View"
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      rollupOptions: {
      }
    }
  };
});
