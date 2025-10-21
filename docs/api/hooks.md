# Hooks API

React hooks for XR functionality.

## useXRSessionModeSupportedPolling

Check if specific XR session modes are supported.

```tsx
import { useXRSessionModeSupportedPolling } from 'r3f-xr-widgets'

function MyComponent() {
  const vrSupported = useXRSessionModeSupportedPolling('immersive-vr')
  const arSupported = useXRSessionModeSupportedPolling('immersive-ar')

  return (
    <div>
      VR: {vrSupported ? '✓' : '✗'}
      AR: {arSupported ? '✓' : '✗'}
    </div>
  )
}
```

### Parameters

- **mode** `XRSessionMode` - The session mode to check (`'immersive-vr'` or `'immersive-ar'`)

### Returns

- `boolean | undefined` - `true` if supported, `false` if not, `undefined` while checking
