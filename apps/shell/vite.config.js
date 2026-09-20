import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  envDir: '../../',
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        buyer: 'http://localhost:5174/assets/remoteEntry.js',
        seller: 'http://localhost:5175/assets/remoteEntry.js',
        admin: 'http://localhost:5176/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: { 
    port: 5173, 
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }, preview: { port: 5173, strictPort: true, cors: true },
  build: { target: 'esnext', minify: false, cssCodeSplit: false }
})
