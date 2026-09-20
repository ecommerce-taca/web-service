import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  envDir: '../../',
  plugins: [
    react(),
    federation({
      name: 'seller',
      filename: 'remoteEntry.js',
      exposes: { './App': './src/app/App.jsx' },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: { port: 5175, cors: true }, preview: { port: 5175, strictPort: true, cors: true },
  build: { target: 'esnext', minify: false, cssCodeSplit: false }
})
