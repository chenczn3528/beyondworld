import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      filename: 'sw-beyond.js', // ✅ 与模拟器 A 区分
      scope: '/',   // ✅ base 路径一致
      registerType: 'autoUpdate',
      manifest: {
        name: '世界之外 抽卡模拟器',
        short_name: '世外抽卡',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: 'images/icon.jpg',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      cleanupOutdatedCaches: true,
    })
  ],
  base: '/',
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
    },
  },
})
