import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: '오프라인 성경',
        short_name: '성경',
        description: '광고 없이 빠르게 성경을 읽고 검색할 수 있는 PWA',
        theme_color: '#000000',
        background_color: '#f4f5f7',
        display: 'standalone',
        lang: 'ko',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        cleanupOutdatedCaches: true,
        globIgnores: ['**/japanese_bible.json', '**/italian_bible.json'],
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
