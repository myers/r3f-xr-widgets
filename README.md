# r3f-xr-widgets

> Reusable XR/VR widgets and utilities for React Three Fiber

A collection of production-ready components and utilities for building WebXR experiences with React Three Fiber. Includes resizable windows, splash screens, eye-level positioning, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **ResizableWindow** - Draggable, resizable 3D windows with audio feedback and haptic responses
- **SplashScreen** - Beautiful XR session entry with VR/AR mode selection
- **EyeLevelGroup** - Automatic eye-level positioning for comfortable viewing
- **Audio & Haptics** - Built-in positional audio and controller haptic feedback

## Live Demos

**[View Live Demos](https://icepick.info/r3f-xr-widgets/)** - Interactive examples of all components

Try the demos in your VR headset or browser to see the components in action!

## Installation

```bash
npm install r3f-xr-widgets
# or
pnpm add r3f-xr-widgets
# or
yarn add r3f-xr-widgets
```

### Peer Dependencies

```bash
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/xr @react-three/handle
```

## Quick Start

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

## Components

See all components in action: **[Live Demos](https://icepick.info/r3f-xr-widgets/)**

### ResizableWindow

An interactive 3D window with drag-to-move and resize handles. **[Try it live →](https://icepick.info/r3f-xr-widgets/widgets)**

```tsx
import { ResizableWindow } from 'r3f-xr-widgets'

<ResizableWindow
  position={[0, 1.5, -1]}
  aspectRatio={16/9}
  baseScale={0.3}
  handleColor="#ff9999"
  initiallyRotateTowardsCamera={true}
  autoRotateToCamera={false}
>
  {/* Your content here */}
</ResizableWindow>
```

**Props:**

- `position` - Position in 3D space `[x, y, z]` (default: `[0, 0, -0.4]`)
- `aspectRatio` - Width/height ratio (default: `16/9`)
- `baseScale` - Base size of the window (default: `0.3`)
- `handleColor` - Color of drag/resize handles (default: `'grey'`)
- `initiallyRotateTowardsCamera` - Rotate to face camera on mount (default: `true`)
- `autoRotateToCamera` - Continuously face camera (default: `false`)
- `onScaleChange` - Callback when window is resized

**Features:**

- Drag bottom handle to move
- Drag top-right handle to resize
- Positional audio feedback on interaction
- Haptic feedback on XR controllers
- Optional camera-facing rotation

### SplashScreen

Full-screen overlay for entering XR sessions with automatic VR/AR detection. **[Try it live →](https://icepick.info/r3f-xr-widgets/widgets)**

```tsx
import { SplashScreen } from 'r3f-xr-widgets'
import { createXRStore } from '@react-three/xr'

const store = createXRStore()

<SplashScreen store={store} modes={['immersive-vr', 'immersive-ar']}>
  <h1>Welcome to VR</h1>
  <p>Put on your headset and click Enter VR</p>
</SplashScreen>
```

**Props:**

- `store` - XR store from `createXRStore()` (required)
- `children` - Content to display in the splash screen
- `modes` - Array of XR modes to support (default: `['immersive-vr', 'immersive-ar']`)

**Features:**

- Automatically hides when XR session starts
- Detects VR/AR support
- Customizable content via children
- Shows single or dual mode buttons

### EyeLevelGroup

Positions children at user's eye level for comfortable viewing.

```tsx
import { EyeLevelGroup, DEFAULT_EYE_LEVEL } from 'r3f-xr-widgets'

<EyeLevelGroup defaultEyeLevel={DEFAULT_EYE_LEVEL}>
  <mesh position={[0, 0, -1]}>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</EyeLevelGroup>
```

**Props:**

- `defaultEyeLevel` - Default height when not in XR (typically `1.5` meters)
- `children` - React Three Fiber components to position

**Features:**

- Captures actual eye level when entering XR
- Uses default height in non-XR mode
- Captures once per session for stability

### AudioEffects

Global audio effect sources for handle interactions. Must be placed in the scene before any `HandleWithAudio` components.

```tsx
import { AudioEffects } from 'r3f-xr-widgets'

<XR store={store}>
  <AudioEffects />
  {/* Other components */}
</XR>
```

### GitHubBadge

A simple GitHub repository link component for demos.

```tsx
import { GitHubBadge } from 'r3f-xr-widgets'

<GitHubBadge repoUrl="https://github.com/username/repo" />
```

## Hooks

### useXRSessionModeSupportedPolling

Check if specific XR session modes are supported.

```tsx
import { useXRSessionModeSupportedPolling } from 'r3f-xr-widgets'

function MyComponent() {
  const vrSupported = useXRSessionModeSupportedPolling('immersive-vr')
  const arSupported = useXRSessionModeSupportedPolling('immersive-ar')

  return <div>VR: {vrSupported ? '✓' : '✗'}</div>
}
```

## Utilities

### vibrateOnEvent

Trigger haptic feedback on XR controllers.

```tsx
import { vibrateOnEvent } from 'r3f-xr-widgets'

<mesh onPointerDown={(e) => vibrateOnEvent(e, 0.5, 50)}>
  <boxGeometry />
</mesh>
```

**Parameters:**

- `event` - Three.js pointer event
- `intensity` - Vibration strength (0-1)
- `duration` - Duration in milliseconds

### DEFAULT_EYE_LEVEL

Constant for default eye level positioning (1.5 meters).

```tsx
import { DEFAULT_EYE_LEVEL } from 'r3f-xr-widgets'

<mesh position={[0, DEFAULT_EYE_LEVEL, -1]} />
```

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Setup

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Build in watch mode (for development)
pnpm dev

# Run type checking
pnpm typecheck
```

### Running Demos

```bash
# Run widgets demo (HTTPS on port 5273)
pnpm demo

# Run demos landing page (HTTP on port 5173)
pnpm demo:landing

# Build demos for production
pnpm demo:build
```

The widgets demo showcases all library components with interactive examples. It requires HTTPS to enable WebXR features.

## Project Structure

```
r3f-xr-widgets/
├── src/
│   ├── components/       # React components
│   │   ├── ResizableWindow.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── EyeLevelGroup.tsx
│   │   ├── GitHubBadge.tsx
│   │   ├── HandleWithAudio.tsx
│   │   └── Hover.tsx
│   ├── hooks/            # React hooks
│   │   └── useXRSessionModeSupportedPolling.ts
│   ├── utils/            # Utility functions
│   │   └── vibrateOnEvent.ts
│   ├── assets/           # 3D models and audio files
│   └── index.ts          # Main exports
├── demos/
│   ├── index.html        # Landing page
│   └── widgets/          # Interactive demo app
└── dist/                 # Built library (generated)
```

## Browser Support

- **Desktop**: Chrome, Edge, Firefox with WebXR support
- **VR Headsets**: Meta Quest (native browser), PC VR headsets via browser
- **Requirements**: HTTPS for WebXR features (development servers included)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Myers Carpenter

## Acknowledgments

**Core Components Attribution:**
The `ResizableWindow`, `HandleWithAudio`, and `vibrateOnEvent` utilities were adapted from the [@react-three/xr editor example](https://github.com/pmndrs/xr/tree/main/examples/editor). We're grateful to the pmndrs team for their excellent work on WebXR tooling.

**Built with:**

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [@react-three/xr](https://github.com/pmndrs/xr) - WebXR hooks and components
- [@react-three/drei](https://github.com/pmndrs/drei) - Useful helpers for R3F
- [@react-three/handle](https://github.com/pmndrs/handle) - Drag and resize interactions

## Links

- [Live Demos](https://icepick.info/r3f-xr-widgets/)
- [Documentation](https://icepick.info/r3f-xr-widgets/)
- [Example Source Code](https://github.com/myers/r3f-xr-widgets/tree/main/demos)
- [Issues](https://github.com/myers/r3f-xr-widgets/issues)
