import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/r3f-xr-widgets/windows/',
  plugins: [
    react(),
    basicSsl()
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
    // alias: {
    //   'r3f-xr-widgets': resolve(__dirname, '../../src/index.ts'),
    // },
    dedupe: [
      'react',
      'react-dom',
      '@react-three/fiber',
      'three',
      '@react-three/uikit',
      '@react-three/uikit-horizon',
      '@react-three/uikit-lucide',
      '@preact/signals',
      '@preact/signals-core',
    ],
  },
  build: {
    sourcemap: true,
  },
  server: {
    port: 5274,
    sourcemapIgnoreList: () => false,
  },
})