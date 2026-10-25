import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Landing page chạy độc lập (không phải remote của shell) ở cổng riêng
export default defineConfig({
  envDir: '../../',
  publicDir: '../../public',
  plugins: [react()],
  server: { port: 5177 },
  preview: { port: 5177, strictPort: true },
  build: { target: 'esnext', minify: true }
})
