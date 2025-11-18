import { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XR } from '@react-three/xr'
import { PointerEvents } from '@react-three/xr'
import { EnterXRButton } from '../components/EnterXRButton'
import { useXRStore } from './xr-test-setup'

/**
 * Canvas wrapper for Storybook XR stories.
 * Provides complete XR setup with store creation, emulator config,
 * Enter VR button, lighting, and camera positioning for XR demos.
 *
 * Similar to XRTestCanvas but optimized for Storybook presentation.
 */
export function XRStoryCanvas({ children, devUI = false }: { children: ReactNode; devUI?: boolean }) {
  // Create XR store with Meta Quest 3 emulation
  const store = useXRStore({
    emulate: {
      type: 'metaQuest3',
      inject: true,
      primaryInputMode: 'controller',
      devUI, // Default: false for cleaner stories
    },
    offerSession: false,
  })

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Enter VR button for XR session entry */}
      <EnterXRButton store={store} mode="immersive-vr" />

      <Canvas camera={{ position: [0, 1.6, 0], fov: 75 }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls target={[0, 1.5, -2]} />

        {/* XR context with pointer events */}
        <XR store={store}>
          <PointerEvents />
          {children}
        </XR>
      </Canvas>
    </div>
  )
}
