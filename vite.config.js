import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // App-Icons liegen schon fertig gerendert in public/ (keine SVG-Quelle
      // im Repo), deshalb reicht includeAssets statt eines Icon-Generators.
      includeAssets: ['favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Life Dashboard',
        short_name: 'Life Dashboard',
        description: 'Gamifiziertes Life-OS: Schlaf, Training und Finanzen als Stats, XP und Streaks.',
        theme_color: '#0f0f14',
        background_color: '#0f0f14',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'de',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Nur den App-Shell-Build (JS/CSS/HTML/Icons) precachen. Alles
        // andere läuft über die untenstehenden Regeln oder gar nicht durch
        // den Service Worker.
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
        // Live-Daten dürfen NIE aus dem Cache kommen, auch nicht als
        // Fallback offline – sonst sieht man veraltete Werte, ohne es zu
        // merken. NetworkOnly heißt: Service Worker fasst diese Requests
        // gar nicht erst an, jeder Aufruf geht direkt ans Netzwerk.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('supabase.co'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.hostname.endsWith('open-meteo.com'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.hostname.endsWith('ouraring.com'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/.netlify/functions/'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  define: {
    // react-draggable (Abhängigkeit von react-grid-layout) referenziert
    // process.env.DRAGGABLE_DEBUG in seiner internen log()-Hilfsfunktion,
    // die bei JEDEM Drag-Start/-Move aufgerufen wird. Vite stellt "process"
    // im Browser nicht bereit (anders als Webpack), das wirft sonst einen
    // ReferenceError, der die Drag-Start-Logik abbricht, BEVOR die
    // mousemove/mouseup-Listener überhaupt angehängt werden – Drag & Drop
    // wirkt dadurch komplett tot. Ersetzt process.env zur Build-Zeit durch
    // ein leeres Objekt, damit der Zugriff einfach undefined statt eines
    // Fehlers ergibt.
    'process.env': {},
  },
})
