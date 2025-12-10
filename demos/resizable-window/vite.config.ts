import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import pkg from './package.json'

export default defineConfig({
  base: pkg.config.base,
  plugins: [
    react()
  ],
  optimizeDeps: {
    exclude: [
      'r3f-xr-widgets',
      '@preact/signals',
      '@preact/signals-core',
      '@react-three/uikit',
      '@react-three/uikit-horizon',
      '@react-three/uikit-lucide',
    ],
    include: ['@react-three/drei']
  },
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@react-three/fiber',
      'three',
      '@react-three/uikit',
      '@react-three/uikit-horizon',
      '@react-three/uikit-lucide',
      '@preact/signals-core',
      '@pmndrs/pointer-events',
    ],
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: pkg.config.port,
    strictPort: true,
    sourcemapIgnoreList: () => false,
  },
})
