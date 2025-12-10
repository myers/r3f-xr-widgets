# Components

r3f-xr-widgets provides a focused set of components for building WebXR experiences. Each component is designed to solve a specific UX challenge in VR/AR applications.

## Featured Components

These are the primary components you'll use in most projects:

### [HorizonWindow](/api/functions/HorizonWindow)

<Badge type="warning" text="Featured" />

A modern window component with UIKit support, designed to mimic Meta Quest's HorizonOS window styling. Features arc handles for resizing, proximity-based edge visibility, and smooth interactions.

```tsx
<HorizonWindow
  titleBar={<HorizonWindowTitleBar title="My Window" onClose={handleClose} />}
  width={1200}
  height={800}
  pixelSize={0.0015}
>
  <Container flexDirection="column" gap={20}>
    <Text>Your UIKit content here</Text>
  </Container>
</HorizonWindow>
```

**Key Features:**
- Arc-shaped corner handles (HorizonOS style)
- Resizable with min/max constraints
- Movable via title bar or edge handles
- Proximity-based edge visibility
- UIKit integration for flexible content

**Use Cases:**
- Modern VR applications
- UIKit-based interfaces
- Resizable content windows
- HorizonOS-style applications

[View Demo](https://icepick.info/r3f-xr-widgets/horizon-window/)

---

### [QuadVideoPlayer](/api/functions/QuadVideoPlayer)

<Badge type="tip" text="Video" />

Complete VR video player with XR controller support, action indicators, and auto-hide control panel. Built for flat video content with full playback controls.

```tsx
<QuadVideoPlayer
  videoUrl="/path/to/video.mp4"
  title="My Video"
  renderer="videoxr"
/>
```

**Key Features:**
- XR controller integration (A/B buttons, thumbstick)
- Visual action feedback (play/pause/seek/buffering)
- Auto-hide control panel
- Multiple renderers (videoxr, xrlayer, uikit)
- Volume and timeline controls

**Use Cases:**
- Flat video playback in VR
- Media player applications
- Video galleries
- Educational content

[View Demo](https://icepick.info/r3f-xr-widgets/video-player/)

---

### [EquirectPlayer](/api/functions/EquirectPlayer)

<Badge type="tip" text="360° Video" />

Immersive 360°/180° equirectangular video player for VR experiences. Supports both stereoscopic and monoscopic video formats.

```tsx
<EquirectPlayer
  videoUrl="/path/to/360-video.mp4"
  title="360° Experience"
  videoAngle={180}
/>
```

**Key Features:**
- 360° and 180° video support
- Stereoscopic (3D) and monoscopic playback
- XR controller playback controls
- Immersive viewing experience
- UIKit-based control panel

**Use Cases:**
- 360° video experiences
- Virtual tours
- Immersive storytelling
- VR cinema

[View Demo](https://icepick.info/r3f-xr-widgets/3d-video/)

---

### [ResizableWindow](/api/functions/ResizableWindow)

<Badge type="tip" text="Classic" />

An interactive 3D window with drag-to-move and resize handles. Perfect for floating UI panels and content viewers when you need Three.js children (meshes, models) rather than UIKit content.

```tsx
<ResizableWindow position={[0, 1.5, -1]}>
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="hotpink" />
  </mesh>
</ResizableWindow>
```

**Use Cases:**
- Floating control panels
- Content viewers (images, videos, 3D models)
- Interactive dashboards
- Tool palettes

[View Demo](https://icepick.info/r3f-xr-widgets/resizable-window/)

---

### [SplashScreen](/api/functions/SplashScreen)

<Badge type="info" text="Essential" />

Full-screen overlay for entering XR sessions with automatic VR/AR detection and beautiful entry experience.

```tsx
<SplashScreen store={store}>
  <h1>Welcome to VR</h1>
  <p>Put on your headset and click Enter VR</p>
</SplashScreen>
```

**Use Cases:**
- XR session entry
- Loading screens
- Mode selection (VR vs AR)
- User onboarding

## Utility Components

Supporting components that enhance your XR experience:

### HorizonWindowTitleBar

Customizable title bar component for HorizonWindow, styled to match Meta Quest's HorizonOS title bars. Provides window controls and branding.

```tsx
<HorizonWindowTitleBar
  title="My Application"
  onClose={handleClose}
/>
```

**Key Features:**
- HorizonOS-style design
- Close button with haptic feedback
- Optional back button
- Custom title text
- Works seamlessly with HorizonWindow

**Use Cases:**
- Window title bars
- Application branding
- Navigation controls
- Window management

[View Demo](https://icepick.info/r3f-xr-widgets/horizon-window/)

---

### [EyeLevelGroup](/components/eye-level-group)

Automatically positions children at the user's actual eye level in XR, accounting for different user heights.

```tsx
<EyeLevelGroup defaultEyeLevel={1.5}>
  <mesh position={[0, 0, -1]}>
    <boxGeometry />
  </mesh>
</EyeLevelGroup>
```

[Learn more →](/components/eye-level-group)

---

### [AudioEffects](/components/audio-effects)

Global positional audio sources for handle interactions. **Required for ResizableWindow**.

```tsx
<XR store={store}>
  <AudioEffects />
  {/* Your scene */}
</XR>
```

[Learn more →](/components/audio-effects)

---

### [Hover](/components/hover)

Helper component for XR hover interactions with automatic haptic feedback.

```tsx
<Hover>
  {(hovered) => (
    <mesh scale={hovered ? 1.2 : 1}>
      <boxGeometry />
    </mesh>
  )}
</Hover>
```

[Learn more →](/components/hover)

---

### [GitHubBadge](/components/github-badge)

Simple GitHub repository badge/link component for demos.

```tsx
<GitHubBadge repoUrl="https://github.com/username/repo" />
```

[Learn more →](/components/github-badge)

## Environment Components

Components for creating immersive VR environments:

### Skybox

VR environment skybox component that creates an immersive background for your VR scenes. Commonly used to provide visual context and atmosphere.

```tsx
<IfInSessionMode allow="immersive-vr">
  <Skybox />
</IfInSessionMode>
```

**Key Features:**
- Seamless 360° environment
- Optimized for VR rendering
- Works with default skybox texture
- Easy integration

**Use Cases:**
- VR environment background
- Immersive atmosphere
- Visual context for floating UI
- VR application backdrop

[View Demo](https://icepick.info/r3f-xr-widgets/horizon-window/)

---

### GridFloor

Spatial reference grid that helps users understand their position and scale in VR. Provides visual grounding for VR experiences.

```tsx
<GridFloor />
```

**Key Features:**
- Clear spatial reference
- Adjustable size and spacing
- Low visual impact
- Performance optimized

**Use Cases:**
- Spatial awareness in VR
- Scale reference
- Floor indication
- Navigation aid

[View Demo](https://icepick.info/r3f-xr-widgets/video-player/)

## Materials

Custom shader materials for enhanced visual effects:

### HorizonCursorMaterial

Custom VR cursor material designed to match Meta Quest's HorizonOS cursor style. Provides a modern, polished cursor appearance for XR interactions.

```tsx
const store = createXRStore({
  controller: {
    rayPointer: {
      cursorModel: {
        materialClass: HorizonCursorMaterial,
        size: 0.03,
        renderOrder: 999
      }
    }
  }
})
```

**Key Features:**
- HorizonOS-style cursor design
- Optimized for XR rendering
- High render order for visibility
- Seamless integration with @react-three/xr

**Use Cases:**
- VR cursor styling
- HorizonOS-style applications
- Professional XR experiences
- Enhanced visual polish

[View Demo](https://icepick.info/r3f-xr-widgets/horizon-window/)

## Hooks

React hooks for XR interactions and video playback:

### useVideoXRControls

Hook for integrating XR controller buttons with video playback. Maps A/B buttons and thumbstick to play/pause, control panel toggle, and seeking.

```tsx
const { isPlaying, showControls } = useVideoXRControls({
  videoRef,
  requirePointerOn: true
})
```

**Key Features:**
- A button: Play/pause
- B button: Toggle controls
- Right thumbstick: Seek forward/backward
- Pointer-based activation
- Haptic feedback

**Use Cases:**
- Video player controls
- XR controller integration
- Hands-free playback control
- VR media applications

[View Demo](https://icepick.info/r3f-xr-widgets/video-player/)

---

### useXRButtons

Hook for handling XR controller button events with pointer detection. Provides a simple API for responding to controller button presses.

```tsx
const { aPressed, bPressed } = useXRButtons({
  requirePointerOn: true
})
```

**Key Features:**
- Button state tracking
- Pointer-based activation
- Support for A, B, X, Y buttons
- Frame-synchronized updates
- Easy integration

**Use Cases:**
- Custom XR interactions
- Button-based controls
- Pointer-aware actions
- Controller input handling

[View Demo](https://icepick.info/r3f-xr-widgets/video-player/)

## Component Categories

### Window Components

- **HorizonWindow** - Modern HorizonOS-style windows with UIKit
- **HorizonWindowTitleBar** - Title bars for HorizonWindow
- **ResizableWindow** - Classic movable, resizable 3D windows

### Video Players

- **QuadVideoPlayer** - Flat video player with XR controls
- **EquirectPlayer** - 360°/180° immersive video player

### Environment

- **Skybox** - VR environment background
- **GridFloor** - Spatial reference grid

### Materials

- **HorizonCursorMaterial** - HorizonOS-style VR cursor

### Session Management

- **SplashScreen** - XR entry and mode selection

### Positioning Helpers

- **EyeLevelGroup** - Automatic eye-level positioning

### Audio & Haptics

- **AudioEffects** - Shared audio sources
- **Hover** - Haptic feedback wrapper

### Utilities

- **GitHubBadge** - Repository links

### Hooks

- **useVideoXRControls** - Video playback with XR controllers
- **useXRButtons** - XR button event handling

## Quick Comparison

| Component | Interactive | XR Required | Use Case |
|-----------|-------------|-------------|----------|
| HorizonWindow | Yes | No* | Modern HorizonOS-style UI |
| QuadVideoPlayer | Yes | No* | Flat video playback |
| EquirectPlayer | Yes | No* | 360°/180° video |
| ResizableWindow | Yes | No* | Floating UI panels |
| SplashScreen | Yes | Yes | XR session entry |
| Skybox | No | No* | VR environment |
| GridFloor | No | No | Spatial reference |
| EyeLevelGroup | No | No | Comfortable positioning |
| AudioEffects | No | No | Audio feedback |
| Hover | Yes | No* | Hover interactions |
| HorizonCursorMaterial | No | Yes | VR cursor styling |

*Works in both XR and non-XR mode, enhanced features in XR

## Next Steps

- Explore individual component pages for detailed documentation
- Check out [Examples](/guide/examples/basic-window) for common patterns
- Try the [Live Demos](/demos) to see components in action
