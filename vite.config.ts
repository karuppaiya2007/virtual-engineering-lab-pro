import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path must match your GitHub repository name exactly
// Repository: https://github.com/karuppaiya2007/virtual-engineering-lab-pro
export default defineConfig({
  base: '/virtual-engineering-lab-pro/',
  plugins: [react()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          state: ['zustand'],
        }
      }
    }
  }
})
