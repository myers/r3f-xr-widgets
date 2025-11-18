import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/r3f-xr-widgets/widgets/',
  plugins: [react()],
  resolve: {
    dedupe: ['@react-three/fiber', 'three', 'react', 'react-dom'],
  },
  server: {
    port: 9001,
  },
  build: {
    sourcemap: true, // Enable source map generation for production build
  },
})
