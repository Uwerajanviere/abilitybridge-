import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // Split React + Router into vendor chunk
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
