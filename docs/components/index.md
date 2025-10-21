# Components

r3f-xr-widgets provides a focused set of components for building WebXR experiences. Each component is designed to solve a specific UX challenge in VR/AR applications.

## Featured Components

These are the primary components you'll use in most projects:

### [ResizableWindow](/components/resizable-window)

<Badge type="tip" text="Most Popular" />

An interactive 3D window with drag-to-move and resize handles. Perfect for floating UI panels and content viewers.

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

[Learn more →](/components/resizable-window)

---

### [SplashScreen](/components/splash-screen)

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

[Learn more →](/components/splash-screen)

## Utility Components

Supporting components that enhance your XR experience:

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

## Component Categories

### Interactive Widgets
- **ResizableWindow** - Movable, resizable 3D windows

### Session Management
- **SplashScreen** - XR entry and mode selection

### Positioning Helpers
- **EyeLevelGroup** - Automatic eye-level positioning

### Audio & Haptics
- **AudioEffects** - Shared audio sources
- **Hover** - Haptic feedback wrapper

### Utilities
- **GitHubBadge** - Repository links

## Quick Comparison

| Component | Interactive | XR Required | Use Case |
|-----------|-------------|-------------|----------|
| ResizableWindow | Yes | No* | Floating UI panels |
| SplashScreen | Yes | Yes | XR session entry |
| EyeLevelGroup | No | No | Comfortable positioning |
| AudioEffects | No | No | Audio feedback |
| Hover | Yes | No* | Hover interactions |
| GitHubBadge | Yes | No | Demo attribution |

*Works in both XR and non-XR mode, enhanced features in XR

## Next Steps

- Explore individual component pages for detailed documentation
- Check out [Examples](/guide/examples/basic-window) for common patterns
- Try the [Live Demos](https://icepick.info/r3f-xr-widgets/widgets/) to see components in action
- Read the [API Reference](/api/) for comprehensive prop documentation
