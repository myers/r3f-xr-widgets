import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  console.log(`🚀 Running in ${mode} mode - Using library ${isProduction ? 'dist' : 'source'} files`)

  return {
    base: '/r3f-xr-widgets/3d-video/',
    plugins: [react()],
    resolve: {
      // In development: alias to source files for instant HMR
      // In production: use the installed package from node_modules
      ...(!isProduction && {
        alias: {
          'r3f-xr-widgets': resolve(__dirname, '../../src/index.ts'),
        }
      }),
      dedupe: [
        'react',
        'react-dom',
        '@react-three/fiber',
        'three',
        '@react-three/uikit',
        '@react-three/uikit-default',
        '@react-three/uikit-horizon',
        '@react-three/uikit-lucide',
        '@preact/signals-core',
      ],
    },
    server: {
      port: 9004,
    },
    build: {
      sourcemap: true,
    },
  }
})
