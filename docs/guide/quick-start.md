# Quick Start

This guide shows you how to set up a basic XR scene with r3f-xr-widgets.

## Basic Setup

```tsx
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { ResizableWindow, SplashScreen, AudioEffects } from 'r3f-xr-widgets'

const store = createXRStore()

function App() {
  return (
    <>
      <SplashScreen store={store}>
        <h1>Welcome to VR</h1>
      </SplashScreen>

      <Canvas>
        <XR store={store}>
          <AudioEffects />
          <ambientLight />
          <ResizableWindow position={[0, 1.5, -1]}>
            <mesh>
              <boxGeometry />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          </ResizableWindow>
        </XR>
      </Canvas>
    </>
  )
}
```

See [Getting Started](/guide/getting-started) for a detailed walkthrough.
