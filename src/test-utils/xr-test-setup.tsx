import { ReactNode, useMemo, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { createXRStore, XRStoreOptions, XRStore, XR } from '@react-three/xr'
import { PointerEvents } from '@react-three/xr'
import { EnterXRButton } from '../components/EnterXRButton'
import { LOCAL_XR_ASSET_PATH } from './xr-test-config'
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:test:setup')

/**
 * Hook that creates an XR store and automatically cleans up navigator.xr on unmount.
 * This prevents "InvalidStateError" and "Context Lost" errors on Storybook reruns.
 */
export function useXRStore(options?: XRStoreOptions): XRStore {
  const store = useMemo(() => createXRStore({
    // Use local assets to avoid CDN calls in tests
    baseAssetPath: LOCAL_XR_ASSET_PATH,
    ...options
  }), [])

  useEffect(() => {
    return () => {
      // Use the store's cleanupEmulator() method which internally waits for
      // emulator injection to complete before cleaning up
      store.cleanupEmulator().catch((err) => {
        debug('useXRStore: Error during cleanup:', err)
      })
    }
  }, [store])

  return store
}

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

/**
 * Canvas wrapper for XR tests.
 * Provides complete XR test setup with store creation, emulator config,
 * Enter VR button, and scene/store references on canvas element.
 */
export function XRTestCanvas({ children, devUI = false }: { children: ReactNode; devUI?: boolean }) {
  // Create XR store with default test emulator config
  const store = useXRStore({
    emulate: {
      type: 'metaQuest3',
      inject: true,
      primaryInputMode: 'controller',
      devUI, // Configurable DevUI (default: false to prevent thumbstick interference)
    },
    offerSession: false,
  })

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Enter VR button - needed for all tests */}
      <EnterXRButton store={store} mode="immersive-vr" />

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
