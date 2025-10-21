# ResizableWindow

<Badge type="tip" text="Featured" /> <Badge type="info" text="Interactive" /> <Badge type="warning" text="Requires AudioEffects" />

An interactive 3D window component with drag-to-move and resize handles. Perfect for floating UI panels, content viewers, and interactive widgets in VR/AR.

## Overview

The **ResizableWindow** is the core component of r3f-xr-widgets. It provides a familiar window-like interface that users can manipulate in 3D space with intuitive drag handles.

::: tip Why Use ResizableWindow?
ResizableWindow provides a familiar user experience that users instantly understand - they can move and resize it just like traditional desktop windows. The handles maintain a constant visual size regardless of the window's scale, ensuring they're always easy to grab. Every interaction includes immersive feedback through positional audio and haptic responses on XR controllers. The component also supports optional camera-facing rotation so windows can always face the user for comfortable viewing.
:::

## Quick Start

```tsx
import { ResizableWindow, AudioEffects } from 'r3f-xr-widgets'

function Scene() {
  return (
    <>
      {/* Required: Audio sources for handle interactions */}
      <AudioEffects />

      {/* Basic resizable window */}
      <ResizableWindow position={[0, 1.5, -1]}>
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </ResizableWindow>
    </>
  )
}
```

## Key Features

### Drag to Move

Grab the **bottom handle** (rounded bar) to move the window in 3D space. The window follows your controller or pointer smoothly.

```tsx
<ResizableWindow position={[0, 1.5, -1]}>
  {/* Your content */}
</ResizableWindow>
```

### Drag to Resize

Grab the **top-right handle** (rotate icon) to resize the window. Scaling is uniform to maintain the aspect ratio.

```tsx
<ResizableWindow
  baseScale={0.5}           // Larger initial size
  aspectRatio={16 / 9}      // Widescreen format
  onScaleChange={(scale) => console.log('New scale:', scale)}
>
  {/* Your content */}
</ResizableWindow>
```

### Camera-Facing Rotation

Windows can automatically rotate to face the user's camera for comfortable viewing.

```tsx
<ResizableWindow
  initiallyRotateTowardsCamera={true}  // Rotate once on mount
  autoRotateToCamera={false}           // Don't continuously rotate
>
  {/* Your content */}
</ResizableWindow>
```

::: warning Continuous Rotation
`autoRotateToCamera={true}` makes the window constantly face the camera. This can be disorienting during drag operations, so it automatically pauses while dragging.
:::

### Audio Feedback

Positional audio plays when grabbing and releasing handles, providing spatial awareness.

```tsx
// Required: Place AudioEffects in your scene
<AudioEffects />

// All ResizableWindow components will use the shared audio sources
<ResizableWindow position={[0, 1.5, -1]}>
  {/* Your content */}
</ResizableWindow>
```

### Haptic Feedback

XR controllers vibrate on interaction, enhancing the sense of touch.

```tsx
// Haptic feedback is automatic on XR controllers
// No configuration needed!
<ResizableWindow>
  {/* Your content */}
</ResizableWindow>
```

## Props

### `children`
- **Type:** `ReactNode`
- **Required:** No

React children to render inside the window. Can be any React Three Fiber components (meshes, groups, etc.).

### `position`
- **Type:** `[number, number, number]`
- **Default:** `[0, 0, -0.4]`

Initial position in 3D space as `[x, y, z]`. Recommended to position at eye level (`y: 1.5`) for comfortable viewing.

```tsx
<ResizableWindow position={[0, 1.5, -1]}>
  {/* Positioned at eye level, 1 meter forward */}
</ResizableWindow>
```

### `aspectRatio`
- **Type:** `number`
- **Default:** `16 / 9`

Width-to-height ratio of the window. Common values:
- `16 / 9` - Widescreen (default)
- `4 / 3` - Standard
- `1` - Square

```tsx
<ResizableWindow aspectRatio={1}>
  {/* Square window */}
</ResizableWindow>
```

### `baseScale`
- **Type:** `number`
- **Default:** `0.3`

Base size of the window in meters (the height). Larger values create bigger windows.

```tsx
<ResizableWindow baseScale={0.5}>
  {/* Larger window (0.5m tall) */}
</ResizableWindow>
```

### `handleColor`
- **Type:** `string | number`
- **Default:** `'grey'`

Color of the drag and resize handles. Accepts any Three.js color format.

```tsx
<ResizableWindow handleColor="hotpink">
  {/* Pink handles */}
</ResizableWindow>
```

### `initiallyRotateTowardsCamera`
- **Type:** `boolean`
- **Default:** `true`

Rotate the window to face the camera once on mount. Recommended for windows that should face the user.

### `autoRotateToCamera`
- **Type:** `boolean`
- **Default:** `false`

Continuously rotate the window to face the camera. Pauses automatically during drag operations.

::: tip When to Use Auto-Rotate
Use `autoRotateToCamera={true}` for:
- Dashboard panels that should always face the user
- Information displays that follow the user's movement

Avoid for:
- Windows the user positions precisely
- Multi-window layouts where rotation would be disorienting
:::

### `onScaleChange`
- **Type:** `(scale: Vector3) => void`
- **Required:** No

Callback fired when the user resizes the window.

```tsx
<ResizableWindow
  onScaleChange={(scale) => {
    console.log('Window scaled to:', scale.x)
  }}
>
  {/* Your content */}
</ResizableWindow>
```

## Examples

### Basic Content Window

```tsx
<ResizableWindow
  position={[0, 1.5, -1]}
  baseScale={0.4}
  handleColor="#4CAF50"
>
  <Text position={[0, 0, 0.01]} fontSize={0.05}>
    Hello VR!
  </Text>
</ResizableWindow>
```

### Widescreen Video Panel

```tsx
<ResizableWindow
  position={[-0.5, 1.5, -1.5]}
  aspectRatio={16 / 9}
  baseScale={0.5}
  initiallyRotateTowardsCamera={true}
>
  <mesh>
    <planeGeometry args={[0.8, 0.45]} />
    <meshBasicMaterial>
      <videoTexture attach="map" args={[videoElement]} />
    </meshBasicMaterial>
  </mesh>
</ResizableWindow>
```

### Dashboard That Follows User

```tsx
<ResizableWindow
  position={[0, 1.5, -0.8]}
  autoRotateToCamera={true}
  baseScale={0.35}
  handleColor="cyan"
>
  {/* Dashboard content */}
</ResizableWindow>
```

## Best Practices

### Positioning

**Recommended:** Position windows at eye level (y: 1.5) for comfortable viewing. This ensures users don't need to look up or down uncomfortably.

```tsx
<ResizableWindow position={[0, 1.5, -1]}>
```

**Avoid:** Positioning windows too low or too high, which forces uncomfortable neck angles.

```tsx
<ResizableWindow position={[0, 0.5, -1]}> {/* Too low! */}
```

### Sizing

**Recommended:** Use reasonable base scales between 0.2 and 0.6 meters. This range provides good readability while fitting comfortably in the user's field of view.

```tsx
<ResizableWindow baseScale={0.3}>
```

**Avoid:** Making windows too large (over 1 meter) or tiny (under 0.1 meters), as this creates readability issues or dominates the view.

```tsx
<ResizableWindow baseScale={2}> {/* Way too big! */}
```

### Multiple Windows

**Recommended:** Space windows apart to avoid overlap. Give each window enough room so users can clearly see and interact with all handles.

```tsx
<ResizableWindow position={[-0.5, 1.5, -1]} />
<ResizableWindow position={[0.5, 1.5, -1]} />
```

### AudioEffects

**Recommended:** Include AudioEffects once in your scene. All ResizableWindow components will share the same audio sources for consistent feedback.

```tsx
<XR>
  <AudioEffects />
  <ResizableWindow />
  <ResizableWindow />
</XR>
```

**Avoid:** Forgetting to include AudioEffects, which means users won't get audio feedback on handle interactions. Also avoid adding multiple AudioEffects instances, as this can cause overlapping sounds.

```tsx
<XR>
  <ResizableWindow /> {/* No audio feedback! */}
</XR>
```

## Attribution

The ResizableWindow component was adapted from the [@react-three/xr editor example](https://github.com/pmndrs/xr/tree/main/examples/editor). Thanks to the pmndrs team for their excellent WebXR work!

## Related

- [AudioEffects](/components/audio-effects) - Required for audio feedback
- [Hover](/components/hover) - Used internally for handle hover states
- [vibrateOnEvent](/api/utilities#vibrateoneven) - Used internally for haptic feedback
