import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '')

  return {
    // Build production phục vụ dưới /remotes/<app>/ (Dockerfile đặt VITE_BASE); dev/preview giữ '/'
    base: env.VITE_BASE || '/',
    envDir: '../../',
    plugins: [
      react(),
      federation({
        name: 'admin',
        filename: 'remoteEntry.js',
        exposes: { './App': './src/app/App.jsx' },
        shared: ['react', 'react-dom', 'react-router-dom']
      })
    ],
    server: { 
      port: 5176, 
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_GATEWAY_TARGET || 'http://localhost:8081',
          changeOrigin: true,
        }
      }
    },
    preview: { port: 5176, strictPort: true, cors: true },
    build: { target: 'esnext', minify: true, cssCodeSplit: false, modulePreload: false }
  }
})
