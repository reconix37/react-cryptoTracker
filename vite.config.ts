import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',

      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],

      manifest: {
        name: 'CryptoTracker - Portfolio Manager',
        short_name: 'CryptoTracker',
        description: 'Track your cryptocurrency portfolio with real-time prices and analytics',
        theme_color: '#6366f1',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        categories: ['finance', 'productivity', 'utilities'],
      },

      workbox: {

        disableDevLogs: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.coingecko\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'coingecko-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 10
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
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
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.coingecko\.com\/.*\.(png|jpg|jpeg|svg|gif)/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'coingecko-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.firebaseio\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60
              }
            }
          }
        ],

        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: null
      },

      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },

  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/crypto': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const targetPath = url.searchParams.get('path');
          url.searchParams.delete('path');
          return `/${targetPath}${url.search}`;
        }
      }
    }
  },

  preview: {
    port: 3000,
    host: true,
    proxy: {
      '/api/crypto': {
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const targetPath = url.searchParams.get('path');
          url.searchParams.delete('path');
          return `/${targetPath}${url.search}`;
        }
      }
    }
  }
})