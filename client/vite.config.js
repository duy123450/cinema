import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/server/api',
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    reportCompressedSize: false,
    emptyOutDir: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true
      }
    }
  },

})