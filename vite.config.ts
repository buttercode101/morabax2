import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['icon.svg'],
        manifest: {
          name: 'Morabaraba',
          short_name: 'Morabaraba',
          description: 'The definitive digital version of the official South African indigenous strategy board game.',
          theme_color: '#b45309',
          background_color: '#2a1d16',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}']
        },
        devOptions: { enabled: false }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      hmr: typeof process !== 'undefined' && process.env.DISABLE_HMR !== 'true',
    },
  };
});
