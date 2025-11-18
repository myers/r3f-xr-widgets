import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/r3f-xr-widgets/windows/',
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
    ],
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 9002,
    sourcemapIgnoreList: () => false,
  },
})
