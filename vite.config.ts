import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    copyPublicDir: true
  },
  // Enable SPA routing fallback
  preview: {
    port: 4173,
    strictPort: true,
  }
})
