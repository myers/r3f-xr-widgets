# r3f-xr-widgets

A collection of components and utilities for building WebXR experiences with
React Three Fiber.  Includes resizable windows, splash screens, eye-level
positioning, and more.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **EquirectPlayer** - 360°/180° video player with XR Layer rendering and UIKit controls
- **HorizonWindow** - Draggable, resizable 3D windows with audio feedback and haptic responses
- **QuadVideoPlayer** - 2d video player using XR Layer rendering
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
npm install react react-dom three @react-three/fiber @react-three/drei @react-three/xr @react-three/handle @react-three/uikit @react-three/uikit-default @react-three/uikit-lucide @preact/signals-core @react-spring/three
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

## API

For detailed documentation, props, and examples, see the **[Documentation](https://icepick.info/r3f-xr-widgets/)**.

**Components** — [View all →](https://icepick.info/r3f-xr-widgets/components/)

- `HorizonWindow`, `ResizableWindow` - Draggable 3D windows
- `EquirectPlayer`, `QuadVideoPlayer` - video players
- `SplashScreen`, `EnterXRButton`, `EyeLevelGroup` - XR session utilities
- `AudioEffects`, `Hover`, `GitHubBadge` - UI helpers

**Hooks** — [API Reference →](https://icepick.info/r3f-xr-widgets/api/)

- `useXRButtons` - XR controller button/thumbstick events
- `useVideoXRControls` - Video playback with XR controls
- `useXRSessionModeSupportedPolling` - Check XR mode support
- `useVideoMetadata` - Video dimensions and metadata

**Utilities**

- `vibrateOnEvent` - Trigger haptic feedback
- `DEFAULT_EYE_LEVEL` - Standard eye level (1.5m)

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

### Testing

This library uses Vitest with browser mode for automated XR testing.

```bash
# Run all tests
pnpm test
```

**Key Features:**

- Test XR interactions without physical hardware
- Programmatically control virtual XR controllers
- Run tests in CI/CD pipelines

### Running Demos

To run a demo, cd into its directory and run `pnpm dev`:

```bash
cd demos/video-player && pnpm dev
```

Available demos:

- `demos/resizable-window/` - Draggable/resizable windows
- `demos/horizon-window/` - Horizon-style windows
- `demos/video-player/` - 360° video player
- `demos/3d-video/` - 3D video playback

## Project Structure

```
r3f-xr-widgets/
├── src/           # Library source (components, hooks, utils, assets)
├── demos/         # Demo applications
├── docs/          # VitePress documentation
└── dist/          # Built library (generated)
```

## Debugging

This library uses the [`debug`](https://www.npmjs.com/package/debug) package for logging. Debug output is disabled by default and can be enabled as needed.

### Browser (Demos)

Enable debug logging in your browser console:

```js
localStorage.debug = 'r3f-xr-widgets:*'
// Then refresh the page
```

To enable specific namespaces:

```js
localStorage.debug = 'r3f-xr-widgets:hooks:*'  // Only hooks
localStorage.debug = 'r3f-xr-widgets:components:*'  // Only components
```

To disable:

```js
localStorage.removeItem('debug')
// Then refresh the page
```

### Tests

Enable debug logging in vitest browser tests using the `DEBUG_LOGGING` environment variable:

```bash
DEBUG_LOGGING='r3f-xr-widgets:*' pnpm test
DEBUG_LOGGING='r3f-xr-widgets:hooks:*' pnpm test
```

**Note:** Colors are disabled by default in tests for cleaner output. This is accomplished by overriding the `debug` package's `useColors` function in the test setup, since the browser implementation of `debug` does not natively support disabling colors via environment variables. To enable colors:

```bash
DEBUG_COLORS=1 DEBUG_LOGGING='r3f-xr-widgets:*' pnpm test
```

### Available Namespaces

- `r3f-xr-widgets:*` - All library logs
- `r3f-xr-widgets:hooks:*` - All hooks (xr-buttons, xr-session)
- `r3f-xr-widgets:components:*` - All components (enter-xr, horizon-window, video-xr, etc.)
- `r3f-xr-widgets:materials:*` - Material shaders (edge-uv, arc)
- `r3f-xr-widgets:test:*` - Test utilities (controller, setup)
- `r3f-xr-widgets:icons:*` - Icon components

**Note:** In Chromium-based browsers (Chrome, Edge, Brave), you may need to set the console log level to "Verbose" to see debug output.

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

- The `ResizableWindow`, `HandleWithAudio`, and `vibrateOnEvent` utilities were adapted from the [@react-three/xr editor example](https://github.com/pmndrs/xr/tree/main/examples/editor).

**Built with:**

- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [@react-three/xr](https://github.com/pmndrs/xr) - WebXR hooks and components
- [@react-three/drei](https://github.com/pmndrs/drei) - Useful helpers for R3F
- [@react-three/handle](https://github.com/pmndrs/handle) - Drag and resize interactions

## Links

- [Documentation](https://icepick.info/r3f-xr-widgets/)
- [Live Demos](https://icepick.info/r3f-xr-widgets/demos)
- [GitHub](https://github.com/myers/r3f-xr-widgets)
