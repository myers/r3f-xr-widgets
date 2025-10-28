import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/r3f-xr-widgets/widgets/',
  plugins: [react(), basicSsl()],
  resolve: {
    dedupe: ['@react-three/fiber', 'three', 'react', 'react-dom'],
  },
  server: {
    port: 5273,
  },
})