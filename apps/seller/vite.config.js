import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '')

  return {
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
    server: { 
      port: 5175, 
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_GATEWAY_TARGET || 'http://localhost:8081',
          changeOrigin: true,
        }
      }
    },
    preview: { port: 5175, strictPort: true, cors: true },
    build: { target: 'esnext', minify: true, cssCodeSplit: false, modulePreload: false }
  }
})
