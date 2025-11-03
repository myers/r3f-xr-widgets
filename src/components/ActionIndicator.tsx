import { useEffect, useRef, useState } from "react"
import { IconFlash, type IconType } from "./IconFlash"
import { WaitingIcon } from "./WaitingIcon"

interface ActionIndicatorProps {
  video: HTMLVideoElement
}

export const ActionIndicator = ({ video }: ActionIndicatorProps) => {
  const [icon, setIcon] = useState<IconType | null>(null)
  const [isBuffering, setIsBuffering] = useState(false)
  const lastTimeRef = useRef(0)
  const timeThreshold = 1 // seconds threshold to detect significant time changes

  useEffect(() => {
    if (!video) return

    const handlePlay = () => {
      setIcon("play")
      // Reset icon after animation
      setTimeout(() => setIcon(null), 1000)
    }

    const handlePause = () => {
      setIcon("pause")
      // Reset icon after animation
      setTimeout(() => setIcon(null), 1000)
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
          setIcon("rewind")
        } else {
          setIcon("fast_forward")
        }
        // Reset icon after animation
        setTimeout(() => setIcon(null), 1000)
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
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("waiting", handleWaiting)
      video.removeEventListener("playing", handlePlaying)
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [video])

  if (isBuffering) return <WaitingIcon />
  if (!icon) return null

  return <IconFlash name={icon} />
}
