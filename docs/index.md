---
layout: home

hero:
  name: r3f-xr-widgets
  text: XR/VR Widgets for React Three Fiber
  tagline: XR widgets and utilities for React Three Fiber
  image:
    src: /logo.svg
    alt: r3f-xr-widgets
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Components
      link: /components/
    - theme: alt
      text: Try Demos
      link: /demos

features:
  - title: Resizable Windows
    details: Draggable, resizable 3D windows with audio feedback and haptic responses for XR controllers
  - title: XR Session Management
    details: Beautiful splash screens with automatic VR/AR detection and session entry
  - title: Eye-Level Positioning
    details: Automatic eye-level positioning for comfortable viewing across different users
  - title: Audio & Haptics
    details: Built-in positional audio and controller haptic feedback for immersive interactions
  - title: TypeScript First
    details: Fully typed components with comprehensive IntelliSense support
  - title: Small & Focused
    details: Minimal bundle size with tree-shaking support and zero dependencies
---

## Quick Example

```tsx
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { ResizableWindow, SplashScreen, AudioEffects } from 'r3f-xr-widgets'

const store = createXRStore()

function App() {
  return (
    <>
      <SplashScreen store={store}>
        <h1>My VR App</h1>
        <p>Click Enter VR to begin</p>
      </SplashScreen>

      <Canvas>
        <XR store={store}>
          <AudioEffects />
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
