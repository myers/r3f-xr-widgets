import { ReactNode, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XRStore, XR } from '@react-three/xr'
import { PointerEvents } from '@react-three/xr'
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:test:setup')

/**
 * Internal component that captures scene and stores it on canvas element.
 * Also stores the XR store reference for test access.
 */
function SceneCapture({ store }: { store: XRStore }) {
  const { scene, gl } = useThree()

  useEffect(() => {
    // Use gl.domElement instead of document.querySelector - more reliable
    const canvas = gl.domElement
    ;(canvas as any).__xrStore = store
    ;(canvas as any).__scene = scene
  }, [scene, store, gl])

  return null
}

export interface XRTestCanvasProps {
  store: XRStore
  children: ReactNode
}

/**
 * Canvas wrapper for XR tests.
 * Accepts a pre-created XR store (from createTestXRStore) to avoid act() warnings.
 * Provides Enter VR button and scene/store references on canvas element.
 */
export function XRTestCanvas({ store, children }: XRTestCanvasProps) {
  // Track session state to hide button when in VR
  const [session, setSession] = useState<XRSession | null>(null)

  useEffect(() => {
    // Subscribe to store for session changes
    const unsubscribe = store.subscribe((state) => {
      setSession(state.session ?? null)
    })
    // Initialize with current state
    setSession(store.getState().session ?? null)
    return unsubscribe
  }, [store])

  // Register cleanup on unmount
  useEffect(() => {
    return () => {
      store.cleanupEmulator().catch((err) => {
        debug('XRTestCanvas: Error during cleanup:', err)
      })
    }
  }, [store])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Simple Enter VR button - no polling hook, iwer already ready */}
      {session == null && (
        <button onClick={() => store.enterXR('immersive-vr')}>Enter VR</button>
      )}

      <Canvas camera={{ position: [0, 1.6, 0], fov: 75 }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls target={[0, 1.5, -2]} />

        {/* Capture scene and store on canvas element */}
        <SceneCapture store={store} />

        {/* XR context with pointer events */}
        <XR store={store}>
          <PointerEvents />
          {children}
        </XR>
      </Canvas>
    </div>
  )
}
