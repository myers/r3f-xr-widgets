import { useEffect, useRef, useState } from 'react'

/**
 * Temporary polling-based hook to check if a specific XRSessionMode is supported.
 *
 * This polls navigator.xr.isSessionSupported() every 100ms until support is detected.
 * Once the React XR PR with devicechange support is merged, this can be replaced
 * with the event-driven implementation from @react-three/xr.
 *
 * @param mode - The XRSessionMode to check ('immersive-vr' | 'immersive-ar' | 'inline')
 * @returns boolean | undefined - true if supported, false if not, undefined if still checking
 */
export function useXRSessionModeSupportedPolling(mode: XRSessionMode): boolean | undefined {
  const [supported, setSupported] = useState<boolean | undefined>(undefined)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    // If we already found support, no need to poll
    if (supported === true) {
      startTimeRef.current = null // Reset for next time
      return
    }

    // Set start time only once (when null)
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now()
    }

    // Check immediately
    const checkSupport = () => {
      if (typeof navigator === 'undefined' || !navigator.xr) {
        setSupported(false)
        return false
      }

      navigator.xr
        .isSessionSupported(mode)
        .then((isSupported) => {
          setSupported(isSupported)
        })
        .catch(() => {
          setSupported(false)
        })

      return true
    }

    // Initial check
    const hasNavigatorXR = checkSupport()

    // If no navigator.xr, don't bother polling
    if (!hasNavigatorXR) {
      return
    }

    // Poll every 100ms until support is found
    const interval = setInterval(() => {
      checkSupport()
    }, 100)

    return () => clearInterval(interval)
  }, [mode, supported])

  return supported
}
