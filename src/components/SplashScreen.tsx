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
  },
  childrenWrapper: {
    marginBottom: '10px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '20px',
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

type XRSessionMode = 'immersive-vr' | 'immersive-ar'

interface SplashScreenProps {
  store: XRStore
  children: React.ReactNode
  modes?: XRSessionMode[]
}

export function SplashScreen({ store, children, modes = ['immersive-vr', 'immersive-ar'] }: SplashScreenProps) {
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
            onClick={() => store.enterXR('immersive-ar')}
            style={styles.button}
          >
            Enter AR
          </button>
          <button
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
