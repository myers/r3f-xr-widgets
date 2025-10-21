# Basic Window Example

A simple example showing how to create a resizable window with content.

```tsx
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { ResizableWindow, SplashScreen, AudioEffects } from 'r3f-xr-widgets'
import { Text } from '@react-three/drei'

const store = createXRStore()

function App() {
  return (
    <>
      <SplashScreen store={store}>
        <h1>Basic Window Example</h1>
        <p>Enter VR to see a simple resizable window</p>
      </SplashScreen>

      <Canvas>
        <XR store={store}>
          <AudioEffects />

          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />

          <ResizableWindow
            position={[0, 1.5, -1]}
            baseScale={0.4}
            handleColor="#4CAF50"
          >
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.05}
              color="white"
            >
              Hello VR!
            </Text>
          </ResizableWindow>
        </XR>
      </Canvas>
    </>
  )
}

export default App
```

## Key Points

- Position window at eye level (`y: 1.5`)
- Include `AudioEffects` for handle feedback
- Add basic lighting for visibility
- Content is positioned on the window plane
