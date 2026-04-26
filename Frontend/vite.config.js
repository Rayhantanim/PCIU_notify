import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://pciu-notify-backend.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})