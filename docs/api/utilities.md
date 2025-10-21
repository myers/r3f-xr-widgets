# Utilities API

Helper functions and constants.

## vibrateOnEvent

Trigger haptic feedback on XR controllers.

```tsx
import { vibrateOnEvent } from 'r3f-xr-widgets'

<mesh onPointerDown={(e) => vibrateOnEvent(e)}>
  <boxGeometry />
</mesh>
```

### Parameters

- **event** `any` - Pointer event from React Three Fiber
- **pulse** `PulseConfig` (optional) - Pulse configuration

### PulseConfig

```tsx
interface PulseConfig {
  value?: number      // Intensity 0.0-1.0 (default: 0.3)
  duration?: number   // Duration in ms (default: 50)
}
```

### Example

```tsx
// Default pulse
vibrateOnEvent(event)

// Custom intensity and duration
vibrateOnEvent(event, { value: 0.8, duration: 100 })
```


## DEFAULT_EYE_LEVEL

Constant for default eye level positioning (1.5 meters).

Useful for positioning UI elements and setting your canvas camera height to match the level the EyeLevelGroup will be before XR mode is entered.

```tsx
import { DEFAULT_EYE_LEVEL, EyeLevelGroup } from 'r3f-xr-widgets'

// Set camera height to match EyeLevelGroup's default position
<Canvas camera={{ position: [0, DEFAULT_EYE_LEVEL, 5] }}>
  <EyeLevelGroup defaultEyeLevel={DEFAULT_EYE_LEVEL}>
    <mesh position={[0, 0, -1]}>
      <boxGeometry />
    </mesh>
  </EyeLevelGroup>
</Canvas>
```

**Value:** `1.5` (meters)
