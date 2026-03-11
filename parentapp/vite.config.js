
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      srcDir: 'public', // Aapka firebase-messaging-sw.js public mein hai
      filename: 'firebase-messaging-sw.js',
      strategies: 'injectManifest', // Kyunki hum apna custom Firebase worker use kar rahe hain
      manifest: {
        name: 'Siddhart School Parent App',
        short_name: 'Siddhart School',
        description: 'School Management System for Parents',
        theme_color: '#2563eb', // Aapka blue color
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})