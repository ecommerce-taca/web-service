import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '')
  // Hostname được phép truy cập dev/preview server ngoài localhost (vd. domain public qua Cloudflare Tunnel)
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim()).filter(Boolean)
    : undefined

  return {
    envDir: '../../',
    plugins: [
      react(),
      federation({
        name: 'buyer',
        filename: 'remoteEntry.js',
        exposes: {
          './App': './src/app/App.jsx',
        },
        shared: ['react', 'react-dom', 'react-router-dom']
      })
    ],
    server: { 
      port: 5174, 
      cors: true,
      allowedHosts,
      proxy: {
        '/api': {
          target: env.VITE_GATEWAY_TARGET || 'http://localhost:8081',
          changeOrigin: true,
        }
      }
    },
    preview: { port: 5174, strictPort: true, cors: true, allowedHosts },
    build: { target: 'esnext', minify: true, cssCodeSplit: false, modulePreload: false }
  }
})
