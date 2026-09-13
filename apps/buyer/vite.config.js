import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'buyer',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/app/RemoteApp.jsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: { 
    port: 5174, 
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }, preview: { port: 5174, strictPort: true, cors: true },
  build: { target: 'esnext', minify: false, cssCodeSplit: false }
})
