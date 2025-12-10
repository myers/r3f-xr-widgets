import { type XRStore } from '@react-three/xr'
import { useSyncExternalStore } from 'react'
import { useXRSessionModeSupportedPolling } from '../hooks/useXRSessionModeSupportedPolling'
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:components:enter-xr')

type XRSessionMode = 'immersive-vr' | 'immersive-ar'

/**
 * Props for the EnterXRButton component
 * @group Types
 */
export interface EnterXRButtonProps {
  /** XR store from @react-three/xr */
  store: XRStore
  /** Session mode to enter (default: 'immersive-vr') */
  mode?: XRSessionMode
  /** Custom styles for the container div */
  style?: React.CSSProperties
  /** Custom styles for the button element */
  buttonStyle?: React.CSSProperties
  /** Optional ID for testing */
  id?: string
}

const defaultContainerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
}

const defaultButtonStyle: React.CSSProperties = {
  padding: '16px 32px',
  background: '#007AFF',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1.25rem',
  fontWeight: 'bold',
}

/**
 * A reusable button for entering XR sessions (VR or AR).
 *
 * Automatically hides when an XR session is active, following the same pattern
 * as the SplashScreen component.
 *
 * @group Components
 *
 * @example
 * ```tsx
 * <EnterXRButton store={xrStore} mode="immersive-vr" />
 * ```
 */
export function EnterXRButton(props: EnterXRButtonProps) {
  const { store, mode = 'immersive-vr', style, buttonStyle, id } = props
  const isSupported = useXRSessionModeSupportedPolling(mode)

  // Subscribe to session state using React 18's useSyncExternalStore
  // This is the recommended way to subscribe to external stores and works better
  // with React's testing boundaries than manual subscriptions with useState
  const inSession = useSyncExternalStore(
    // subscribe function: called with a callback that should be invoked when store changes
    (onStoreChange) => store.subscribe(onStoreChange),
    // getSnapshot: returns the current value to render
    () => store.getState().session !== undefined
  )

  // Hide when in session
  if (inSession) {
    return null
  }

  const text = mode === 'immersive-ar' ? 'Enter AR' : 'Enter VR'
  const disabled = !isSupported

  const handleClick = async () => {
    debug('EnterXRButton: handleClick called, mode:', mode)
    try {
      debug('EnterXRButton: Calling store.enterXR()', mode)
      await store.enterXR(mode)
      debug('EnterXRButton: Session started successfully')
    } catch (err) {
      debug('EnterXRButton: Error starting session:', err)
      throw err
    }
  }

  return (
    <div style={{ ...defaultContainerStyle, ...style }}>
      <button
        id={id}
        onClick={handleClick}
        disabled={disabled}
        style={{
          ...defaultButtonStyle,
          ...buttonStyle,
          ...(disabled && {
            background: '#cccccc',
            cursor: 'not-allowed',
            opacity: 0.7,
          }),
        }}
      >
        {disabled ? "Your Browser Doesn't Support WebXR" : text}
      </button>
    </div>
  )
}
