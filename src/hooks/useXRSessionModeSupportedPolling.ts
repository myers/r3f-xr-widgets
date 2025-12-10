import { useEffect, useState, startTransition } from 'react'
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:hooks:xr-session')

/**
 * Temporary polling-based hook to check if a specific XRSessionMode is supported.
 *
 * This polls navigator.xr.isSessionSupported() every 100ms until support is detected.
 * Once the React XR PR with devicechange support is merged, this can be replaced
 * with the event-driven implementation from @react-three/xr.
 *
 * @group Hooks
 *
 * @param mode - The XRSessionMode to check ('immersive-vr' | 'immersive-ar' | 'inline')
 * @returns boolean | undefined - true if supported, false if not, undefined if still checking
 */
export function useXRSessionModeSupportedPolling(mode: XRSessionMode): boolean | undefined {
  const [supported, setSupported] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    let mounted = true
    let interval: ReturnType<typeof setInterval> | null = null

    if (typeof navigator === 'undefined' || !navigator.xr) {
      debug(`[${mode}]: No navigator.xr`)
      setSupported(false)
      return
    }

    const checkSupport = () => {
      navigator.xr!.isSessionSupported(mode)
        .then((isSupported) => {
          if (!mounted) return
          debug(`[${mode}]: isSessionSupported=${isSupported}`)
          startTransition(() => setSupported(isSupported))
          // Stop polling once support is detected
          if (isSupported && interval) {
            clearInterval(interval)
            interval = null
          }
        })
        .catch((err) => {
          if (!mounted) return
          debug(`[${mode}]: error`, err)
          startTransition(() => setSupported(false))
        })
    }

    checkSupport()
    interval = setInterval(checkSupport, 100)

    return () => {
      mounted = false
      if (interval) clearInterval(interval)
    }
  }, [mode])

  return supported
}
