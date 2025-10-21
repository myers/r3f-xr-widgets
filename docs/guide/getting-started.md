# Getting Started

Welcome to **r3f-xr-widgets**! This guide will help you set up your first WebXR application with our component library.

## What is r3f-xr-widgets?

r3f-xr-widgets is a collection of production-ready React components and utilities for building WebXR (Virtual Reality and Augmented Reality) experiences using React Three Fiber.

### Key Features

The library provides interactive 3D windows with resizable, draggable panels perfect for UI in VR/AR environments. Session management makes VR/AR entry easy with automatic device detection, while eye-level positioning ensures comfortable viewing for all users. Every interaction includes immersive feedback through spatial audio and haptic responses. All components are fully typed with TypeScript for an excellent developer experience.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed
- Basic knowledge of **React** and **React Three Fiber**
- A code editor (we recommend VS Code with TypeScript support)

::: tip Testing WebXR
To test WebXR features during development:
- **Desktop**: Use Chrome/Edge with WebXR API Emulator extension
- **VR Headset**: Use the native browser (e.g., Meta Quest Browser)
- **HTTPS Required**: WebXR requires a secure context (the demo servers handle this)
:::

## Installation

Install r3f-xr-widgets and its peer dependencies:

::: code-group
```bash [pnpm]
pnpm add r3f-xr-widgets
pnpm add react react-dom three @react-three/fiber @react-three/drei @react-three/xr @react-three/handle
```

```bash [npm]
npm install r3f-xr-widgets
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/xr @react-three/handle
```

```bash [yarn]
yarn add r3f-xr-widgets
yarn add react react-dom three @react-three/fiber @react-three/drei @react-three/xr @react-three/handle
```
:::

## Your First XR Scene

Let's create a simple VR scene with a resizable window:

```tsx
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { ResizableWindow, SplashScreen, AudioEffects } from 'r3f-xr-widgets'

// Create XR store (do this outside your component)
const store = createXRStore()

function App() {
  return (
    <>
      {/* Splash screen for entering VR */}
      <SplashScreen store={store}>
        <h1>Welcome to VR</h1>
        <p>Put on your headset and click Enter VR</p>
      </SplashScreen>

      {/* Your 3D scene */}
      <Canvas>
        <XR store={store}>
          {/* Required: Audio effects for handle interactions */}
          <AudioEffects />

          {/* Add some lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} />

          {/* A resizable window with content */}
          <ResizableWindow position={[0, 1.5, -1]}>
            <mesh>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          </ResizableWindow>
        </XR>
      </Canvas>
    </>
  )
}

export default App
```

## Understanding the Setup

Let's break down what's happening:

### 1. XR Store

```tsx
const store = createXRStore()
```

The XR store manages your WebXR session state. Create it once outside your component to avoid recreating it on every render.

### 2. SplashScreen

```tsx
<SplashScreen store={store}>
  <h1>Welcome to VR</h1>
</SplashScreen>
```

Shows a full-screen overlay with VR/AR entry buttons. Automatically hides when the XR session starts. You can customize the content with any React children.

### 3. AudioEffects

```tsx
<AudioEffects />
```

**Required** for ResizableWindow! Provides shared positional audio sources that play when users interact with window handles.

### 4. ResizableWindow

```tsx
<ResizableWindow position={[0, 1.5, -1]}>
  {/* Your content */}
</ResizableWindow>
```

An interactive 3D window that users can move and resize. Position it at eye level (1.5m) for comfortable viewing.

## Next Steps

Now that you have a basic scene running:

- Explore [Components](/components/) to learn about all available widgets
- Check out [Examples](/guide/examples/basic-window) for common patterns
- Try the [Live Demos](https://icepick.info/r3f-xr-widgets/widgets/) in your VR headset
- Read the [API Reference](/api/) for detailed prop documentation

::: tip Need Help?
- Check [GitHub Issues](https://github.com/myers/r3f-xr-widgets/issues) for common problems
- Review [example source code](https://github.com/myers/r3f-xr-widgets/tree/main/demos)
- Read the [@react-three/xr documentation](https://github.com/pmndrs/xr)
:::
