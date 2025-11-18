import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  console.log(`🚀 Running in ${mode} mode - Using library ${isProduction ? 'dist' : 'source'} files`)

  return {
    base: '/r3f-xr-widgets/video-player/',
    plugins: [react()],
    resolve: {
      // In development: alias to source files for instant HMR
      // In production: use the installed package from node_modules
      ...(!isProduction && {
        alias: {
          'r3f-xr-widgets': resolve(__dirname, '../../src/index.ts'),
        }
      }),
      dedupe: ['@react-three/fiber', 'three', 'react', 'react-dom'],
    },
    server: {
      port: 9003,
    },
  }
})
