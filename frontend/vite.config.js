import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite Configuration for SkillNexus AI Frontend
 * Configures React plugin, Tailwind CSS v4, and API proxy forwarding
 * to the Node.js/Express backend running on port 5000.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Forward all '/api' requests from React frontend to Express backend at http://localhost:5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Forward static uploaded files (/uploads) to Express backend
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
