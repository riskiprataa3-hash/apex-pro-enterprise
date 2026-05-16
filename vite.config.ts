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
        registerType: 'prompt',
        injectRegister: 'auto',
        includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png', 'pwa-64x64.png', 'pwa-192x192.png', 'pwa-512x512.png', 'maskable-icon-512x512.png', 'screenshot-wide.svg', 'screenshot-narrow.svg'],
        manifestFilename: 'manifest.json',
        manifest: {
          name: 'Apex Pro Enterprise',
          short_name: 'Apex Pro',
          id: 'com.tollguard.apexpro',
          description: 'Sistem Manajemen Lapangan Enterprise PT. SHAKA ANUGERAH KARYA',
          theme_color: '#0f172a',
          background_color: '#0a0a0b',
          display: 'standalone',
          orientation: 'portrait',
          scope: process.env.VITE_BASE_PATH || '/',
          start_url: process.env.VITE_BASE_PATH || '/',
          lang: 'id',
          dir: 'ltr',
          categories: ['productivity', 'business', 'utilities'],
          prefer_related_applications: false,
          display_override: ['standalone', 'window-controls-overlay'],
          shortcuts: [
            {
              name: 'Dashboard',
              url: '/',
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
            },
            {
              name: 'Proyek',
              url: '/?tab=projects',
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
            }
          ],
          screenshots: [
            {
              src: 'screenshot-wide.svg',
              sizes: '1280x720',
              type: 'image/svg+xml',
              form_factor: 'wide',
              label: 'Apex Pro Dashboard'
            },
            {
              src: 'screenshot-narrow.svg',
              sizes: '720x1280',
              type: 'image/svg+xml',
              form_factor: 'narrow',
              label: 'Apex Pro Mobile'
            }
          ],
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html'
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
