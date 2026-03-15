import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', 
      
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],

      // Workbox runtime caching — ensure API calls NEVER get cached by SW
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^.*\/api\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },

      manifest: {
        name: 'Gym-Log',
        short_name: 'Gym-Log',
        description: 'Offline Gym Attendance Tracker',
        theme_color: '#020617', 
        background_color: '#020617', 
        display: 'standalone',
        orientation: 'portrait',
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
});