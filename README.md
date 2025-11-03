# r3f-xr-widgets

A collection of components and utilities for building WebXR experiences with
React Three Fiber.  Includes resizable windows, 360° video player, splash screens,
eye-level positioning, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **360° Video Player** - Immersive equirectangular video playback with XR Layers and UIKit controls
- **ResizableWindow** - Simple draggable, resizable 3D windows with audio feedback and haptic responses
- **HorizonWindow** - HorizonOS-style window with shader-based handles and proximity effects
- **RadialMenu** - XR radial menu with thumbstick navigation and haptic feedback
- **SplashScreen** - Beautiful XR session entry with VR/AR mode selection
- **FaceTowardsCamera** - Camera-facing rotation with composable React pattern
- **EyeLevelGroup** - Automatic eye-level positioning for comfortable viewing
- **Audio & Haptics** - Built-in positional audio and controller haptic feedback
- **Custom Shaders** - Proximity-based arc and line materials for modern UI

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
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/xr @react-three/handle @preact/signals @preact/signals-core @react-spring/three @react-three/uikit @react-three/uikit-default @react-three/uikit-lucide
```

**Notes:**
- `@preact/signals` is required for `HorizonWindow`
- `@preact/signals-core`, `@react-spring/three`, and `@react-three/uikit*` packages are required for video player components

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

### HorizonWindow

A next-generation window component with shader-based handles inspired by Meta's HorizonOS. **[Try it live →](https://icepick.info/r3f-xr-widgets/horizon)**

```tsx
import { useMemo } from 'react'
import { Signal } from '@preact/signals'
import { HorizonWindow } from 'r3f-xr-widgets'
import { Root, Container, Text } from '@react-three/uikit'

const width = useMemo(() => new Signal(800), [])
const height = useMemo(() => new Signal(600), [])

<HorizonWindow
  width={width}
  height={height}
  minWidth={400}
  maxWidth={1400}
  pixelSize={0.0015}
  billboard={false}
>
  <Root width={width} height={height} pixelSize={0.0015}>
    <Container>
      <Text>Hello HorizonOS!</Text>
    </Container>
  </Root>
</HorizonWindow>
```

**Props:**

- `width` - Signal\<number\> for reactive width in pixels (required)
- `height` - Signal\<number\> for reactive height in pixels (required)
- `minWidth` / `maxWidth` - Size constraints in pixels
- `minHeight` / `maxHeight` - Size constraints in pixels
- `pixelSize` - Size of each pixel in meters (default: `0.0015`)
- `billboard` - Enable billboard mode (default: `false`)
- `fadeRadius` - Proximity fade radius (default: `0.225`)
- `onResize` - Callback when resized

**Features:**

- 4 corner handles with 90° arc shaders
- 4 edge handles with line shaders
- Proximity-based fade effects
- Signal-based reactive sizing
- Positional audio and haptic feedback

### 360° Video Player

A complete immersive video player for equirectangular (360°) videos using WebXR Layers. **[Try it live →](https://icepick.info/r3f-xr-widgets/video-player)**

```tsx
import { EquirectPlayer } from 'r3f-xr-widgets'
import { XR, XROrigin, createXRStore } from '@react-three/xr'

const store = createXRStore({
  foveation: 0,
  layers: true,
  domOverlay: false,
})

<XR store={store}>
  <XROrigin position={[0, -0.5, 0.5]} />
  <EquirectPlayer
    title="My 360° Video"
    videoUrl="https://example.com/video.mp4"
    videoAngle={180}
    layout="stereo-left-right"
  />
</XR>
```

**Props:**

- `videoUrl` - URL of the equirectangular video (required)
- `title` - Optional title displayed in control panel
- `videoAngle` - Field of view in degrees (default: `180`)
- `layout` - Video layout: `"mono"`, `"stereo-left-right"`, or `"stereo-top-bottom"` (default: `"stereo-left-right"`)

**Features:**

- WebXR Layers for high-quality rendering
- Stereoscopic 3D video support
- Controller-based playback controls:
  - A button: Play/pause
  - Right thumbstick left/right: Rewind/fast-forward 10s
  - B button: Toggle control panel
- 3D UIKit control panel with:
  - Play/pause, rewind, fast-forward buttons
  - Video timeline with scrubbing
  - Volume control with mute toggle
  - Time display
- Visual action indicators (play, pause, seek, buffering)

**Additional Components:**

The video player is built from several composable components that can be used independently:

- `ControlPanel` / `ControlPanelRoot` - 3D UIKit-based video controls
- `VideoSlider` - Interactive timeline with buffered ranges
- `VolumeControl` - Volume slider with mute toggle
- `ActionIndicator` - Visual feedback for video actions
- `IconFlash` - Animated icon display
- `WaitingIcon` - Buffering spinner

### RadialMenu

A radial menu component for XR that appears when a controller button is held, allowing selection via thumbstick input. **[Try it live →](https://icepick.info/r3f-xr-widgets/radial-menu)**

```tsx
import { RadialMenu, RadialMenuSection } from 'r3f-xr-widgets'

const sections: RadialMenuSection[] = [
  { id: 'option1', label: 'Jump', data: { action: 'jump' } },
  { id: 'option2', label: 'Run', data: { action: 'run' } },
  { id: 'option3', label: 'Crouch', data: { action: 'crouch' } },
  { id: 'option4', label: 'Attack', data: { action: 'attack' } },
]

<RadialMenu
  hand="right"
  triggerButton="b-button"
  sections={sections}
  radius={0.12}
  deadZone={0.3}
  onSelect={(section) => {
    if (section) {
      console.log('Selected:', section.data.action)
    }
  }}
>
  {(section, index, highlighted) => (
    <group>
      {/* Custom renderer for each section */}
    </group>
  )}
</RadialMenu>
```

**Props:**

- `hand` - Controller hand: `'left'` or `'right'` (default: `'right'`)
- `triggerButton` - Button that activates menu (default: `'b-button'`)
- `sections` - Array of `RadialMenuSection` objects (required)
- `onSelect` - Callback when section selected on button release
- `radius` - Menu radius in meters (default: `0.1`)
- `deadZone` - Thumbstick dead zone 0-1 (default: `0.3`)
- `billboard` - Face camera automatically (default: `true`)
- `haptic` - Haptic feedback config `{ value, duration }`
- `children` - Custom renderer function for sections

**Features:**

- Button-activated circular menu
- Thumbstick angle-based navigation
- Spawns at controller position in world space
- Haptic feedback on section changes
- Billboard effect for readability
- Custom renderers via children function
- Configurable dead zone for precision

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
# or
pnpm demo:widgets

# Run HorizonWindow demo (HTTPS on port 5274)
pnpm demo:horizon

# Run RadialMenu demo (HTTPS on port 5274)
pnpm demo:radial-menu

# Run 360° Video Player demo (HTTPS on port 5274)
pnpm demo:video-player

# Run demos landing page (HTTP on port 5173)
pnpm demo:landing

# Build demos for production
pnpm demo:build
```

All demos require HTTPS to enable WebXR features.

## Project Structure

```
r3f-xr-widgets/
├── src/
│   ├── components/       # React components
│   │   ├── ResizableWindow.tsx
│   │   ├── HorizonWindow.tsx
│   │   ├── RadialMenu.tsx
│   │   ├── FaceTowardsCamera.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── EyeLevelGroup.tsx
│   │   ├── GitHubBadge.tsx
│   │   ├── HandleWithAudio.tsx
│   │   ├── Hover.tsx
│   │   ├── EquirectPlayer.tsx
│   │   ├── ControlPanel.tsx
│   │   ├── VideoSlider.tsx
│   │   ├── VolumeControl.tsx
│   │   ├── ActionIndicator.tsx
│   │   ├── IconFlash.tsx
│   │   └── WaitingIcon.tsx
│   ├── materials/        # Custom shader materials
│   │   ├── ArcMaterial.tsx
│   │   ├── EdgeLineMaterial.tsx
│   │   └── CursorMaterial.tsx
│   ├── hooks/            # React hooks
│   │   └── useXRSessionModeSupportedPolling.ts
│   ├── utils/            # Utility functions
│   │   └── vibrateOnEvent.ts
│   ├── assets/           # 3D models and audio files
│   └── index.ts          # Main exports
├── demos/
│   ├── index.html        # Landing page
│   ├── widgets/          # ResizableWindow demo
│   ├── horizon/          # HorizonWindow demo
│   ├── radial-menu/      # RadialMenu demo
│   └── video-player/     # 360° Video Player demo
├── docs/                 # VitePress documentation
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
