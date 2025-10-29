import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This allows access from all network interfaces
    port: 5173,
    strictPort: true,
    open: true, // This will open the browser automatically
    cors: true,
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
})
