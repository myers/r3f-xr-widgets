import { type XRStore } from '@react-three/xr'
import { useState, useEffect } from 'react'
import { useXRSessionModeSupportedPolling } from '../hooks/useXRSessionModeSupportedPolling'

const styles = {
  overlay: {
    position: 'absolute' as const,
    inset: 0,
    backdropFilter: 'blur(20px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    maxWidth: '50vw',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  childrenWrapper: {
    marginBottom: '10px',
    overflow: 'auto',
    flex: 1,
    minHeight: 0,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '20px',
    flexShrink: 0,
  },
  button: {
    padding: '16px 32px',
    background: '#007AFF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
}

/**
 * WebXR session mode types
 */
type XRSessionMode = 'immersive-vr' | 'immersive-ar'

/**
 * Props for the SplashScreen component
 * @group Types
 */
export interface SplashScreenProps {
  /**
   * XR store from @react-three/xr used to manage XR sessions
   */
  store: XRStore

  /**
   * Content to display on the splash screen (typically app title, description, instructions)
   */
  children: React.ReactNode

  /**
   * Which XR modes to offer as entry options.
   * Defaults to both VR and AR modes.
   * The component will check browser support and only show buttons for supported modes.
   * @default ['immersive-vr', 'immersive-ar']
   */
  modes?: XRSessionMode[]
}

/**
 * Full-screen splash overlay with Enter VR/AR buttons
 *
 * Displays an overlay with custom content and XR entry buttons. Automatically hides when
 * an XR session starts. The component intelligently shows VR and/or AR buttons based on:
 * 1. Which modes are specified in the `modes` prop
 * 2. Which modes the browser actually supports
 *
 * If both modes are available, shows two buttons side-by-side. If only one is available,
 * shows a single centered button. If neither is supported, shows a disabled button with
 * an informative message.
 *
 * @group Components
 *
 * @example Basic usage
 * ```tsx
 * import { Canvas } from '@react-three/fiber'
 * import { createXRStore } from '@react-three/xr'
 * import { SplashScreen } from 'r3f-xr-widgets'
 *
 * const store = createXRStore()
 *
 * function App() {
 *   return (
 *     <>
 *       <Canvas>
 *         <XR store={store}>
 *           {/* XR content *\/}
 *         </XR>
 *       </Canvas>
 *       <SplashScreen store={store}>
 *         <h1>Welcome to My XR App</h1>
 *         <p>Put on your headset and enter VR to begin</p>
 *       </SplashScreen>
 *     </>
 *   )
 * }
 * ```
 *
 * @example VR-only mode
 * ```tsx
 * <SplashScreen store={store} modes={['immersive-vr']}>
 *   <h1>VR Experience</h1>
 *   <p>This app requires a VR headset</p>
 * </SplashScreen>
 * ```
 *
 * @example AR-only mode
 * ```tsx
 * <SplashScreen store={store} modes={['immersive-ar']}>
 *   <h1>AR Experience</h1>
 *   <p>Point your device at a flat surface</p>
 * </SplashScreen>
 * ```
 */
export function SplashScreen(props: SplashScreenProps) {
  const { store, children, modes = ['immersive-vr', 'immersive-ar'] } = props
  const [inSession, setInSession] = useState(false)

  useEffect(() => {
    // Initialize state from current store value
    setInSession(store.getState().session !== undefined)

    // Subscribe to future changes
    const unsubscribe = store.subscribe((state, prevState) => {
      if (state.session !== prevState.session) {
        setInSession(state.session !== undefined)
      }
    })

    return unsubscribe
  }, [store])

  if (inSession) {
    return null
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <div style={styles.childrenWrapper}>{children}</div>
        <EnterXRButton store={store} modes={modes} />
      </div>
    </div>
  )
}

const EnterXRButton = ({ store, modes }: { store: XRStore, modes: XRSessionMode[] }) => {
  const vrSupported = useXRSessionModeSupportedPolling('immersive-vr')
  const arSupported = useXRSessionModeSupportedPolling('immersive-ar')

  // Check which modes are both supported by browser AND allowed by config
  const vr = modes.includes('immersive-vr') && vrSupported
  const ar = modes.includes('immersive-ar') && arSupported

  // If both are supported, show both buttons
  if (ar && vr) {
    return (
      <div style={styles.buttonContainer}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            id="enter-ar-btn"
            onClick={() => store.enterXR('immersive-ar')}
            style={styles.button}
          >
            Enter AR
          </button>
          <button
            id="enter-vr-btn"
            onClick={() => store.enterXR('immersive-vr')}
            style={styles.button}
          >
            Enter VR
          </button>
        </div>
      </div>
    )
  }

  // Otherwise show single button
  const text = ar ? 'Enter AR' : vr ? 'Enter VR' : 'Your Browser Doesn\'t Support WebXR'
  const handleClick = () => {
    if (ar) {
      store.enterXR('immersive-ar')
    } else if (vr) {
      store.enterXR('immersive-vr')
    }
  }

  return (
    <div style={styles.buttonContainer}>
      <button
        id={ar ? 'enter-ar-btn' : vr ? 'enter-vr-btn' : undefined}
        onClick={handleClick}
        disabled={!ar && !vr}
        style={{
          ...styles.button,
          ...((!ar && !vr) && {
            background: '#cccccc',
            cursor: 'not-allowed',
            opacity: 0.7,
          }),
        }}
      >
        {text}
      </button>
    </div>
  )
}
