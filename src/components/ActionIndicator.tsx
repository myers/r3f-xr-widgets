import { useEffect, useRef, useState } from "react"
import { IconFlash, type IconType } from "./IconFlash"
import { WaitingIcon } from "./WaitingIcon"

/**
 * @group Types
 */
export interface ActionIndicatorProps {
  video: HTMLVideoElement
}

/**
 * Visual action indicator component that displays play/pause/seek/buffering icons
 * @group Components
 */
export const ActionIndicator = (props: ActionIndicatorProps) => {
  const { video } = props
  const [icon, setIcon] = useState<IconType | null>(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const [iconKey, setIconKey] = useState(0) // Key to force remount of IconFlash
  const lastTimeRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null) // Track current timeout
  const timeThreshold = 1 // seconds threshold to detect significant time changes

  useEffect(() => {
    if (!video) return

    // Helper function to set icon with timeout cleanup
    const setIconWithTimeout = (newIcon: IconType) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      // Set new icon and increment key to force remount
      setIcon(newIcon)
      setIconKey(prev => prev + 1)

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setIcon(null)
        timeoutRef.current = null
      }, 1000)
    }

    const handlePlay = () => {
      setIconWithTimeout("play")
    }

    const handlePause = () => {
      setIconWithTimeout("pause")
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsBuffering(false)
    }

    const handleTimeUpdate = () => {
      const timeDiff = video.currentTime - lastTimeRef.current

      // Only show seek indicators for significant time changes
      if (Math.abs(timeDiff) > timeThreshold) {
        if (timeDiff < 0) {
          setIconWithTimeout("rewind")
        } else {
          setIconWithTimeout("fast_forward")
        }
      }

      lastTimeRef.current = video.currentTime
    }

    // Add event listeners
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("waiting", handleWaiting)
    video.addEventListener("playing", handlePlaying)
    video.addEventListener("timeupdate", handleTimeUpdate)

    // Cleanup
    return () => {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("playing", handlePlaying)
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [video])

  if (isBuffering) return <WaitingIcon />
  if (!icon) return null

  return <IconFlash key={iconKey} name={icon} />
}
