import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
