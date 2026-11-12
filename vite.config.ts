import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'أكاديمية الميكاترونكس اليمنية',
          short_name: 'الميكاترونكس',
          description: 'منصة تعليمية متخصصة لطلاب السنة الأولى في هندسة الميكاترونكس في الجامعات اليمنية',
          theme_color: '#0052cc',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB limit to prevent build errors on Vercel
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
    },
    ssr: {
      noExternal: [],
      external: [
        'express',
        'pg',
        '@neondatabase/serverless',
        'bcryptjs',
        'jsonwebtoken',
        '@google/genai',
        'pdf-parse',
        'dotenv',
        'fs',
        'path',
        'crypto',
        'module',
      ],
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild' as const,
      target: 'es2020',
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        external: (id) => {
          if (
            id.startsWith('node:') ||
            ['express', 'pg', '@neondatabase/serverless', 'bcryptjs', 'jsonwebtoken', 'pdf-parse', 'fs', 'path', 'crypto', 'module'].includes(id)
          ) {
            return true;
          }
          return false;
        },
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-icons': ['lucide-react'],
            'vendor-three': ['three'],
            'vendor-pdf': ['jspdf', 'html2canvas'],
            'vendor-markdown': ['react-markdown'],
          },
        },
      },
    },
  };
});

