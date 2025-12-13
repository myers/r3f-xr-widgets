import { useState, useEffect, useMemo, useCallback } from "react"
import { Container, type ContainerProperties } from "@react-three/uikit"
import { useSpring } from "@react-spring/three"
import { signal } from "@preact/signals-core"
import { ControlPanelCard } from "./ControlPanel"

/**
 * Props for the ControlPanelAutoFade component
 * @group Types
 */
export interface ControlPanelAutoFadeProps extends Omit<ContainerProperties, 'children'> {
  video: HTMLVideoElement
  title?: string
  fadeDelay?: number
  alwaysVisible?: boolean
  toggleRef?: React.MutableRefObject<(() => void) | null>
  /** Name for the Three.js object for scene queries */
  object3DName?: string
}

/**
 * A smart wrapper around ControlPanelCard that handles auto-fade behavior.
 * - Fades out after fadeDelay ms when video is playing
 * - Stays visible when paused or hovered
 * - Encapsulates all auto-fade logic so players don't need to implement it
 *
 * @group Components
 */
export function ControlPanelAutoFade(allProps: ControlPanelAutoFadeProps) {
  const {
    video,
    title,
    fadeDelay = 3000,
    alwaysVisible = false,
    toggleRef,
    object3DName,
    ...containerProps
  } = allProps
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [userHidControls, setUserHidControls] = useState(false)
  const animatedOpacity = useMemo(() => signal(1), [])

  // Create toggle function for B button
  const handleToggle = useCallback(() => {
    setUserHidControls(prev => !prev)
  }, [])

  // Expose toggle function via ref
  useEffect(() => {
    if (toggleRef) {
      toggleRef.current = handleToggle
    }
    return () => {
      if (toggleRef) {
        toggleRef.current = null
      }
    }
  }, [toggleRef, handleToggle])

  // Track video play/pause state
  useEffect(() => {
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    // Set initial state
    setIsPlaying(!video.paused)

    // Add event listeners
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handlePause)

    // Cleanup
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handlePause)
    }
  }, [video])

  // Auto-hide timer
  useEffect(() => {
    // Skip if always visible mode or conditions not met
    if (alwaysVisible || !isPlaying || !isVisible || isHovered) {
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(false)
    }, fadeDelay)

    return () => clearTimeout(timer)
  }, [isPlaying, isVisible, isHovered, fadeDelay, alwaysVisible])

  // Show/hide controls based on user intent and video state
  useEffect(() => {
    if (userHidControls) {
      // User explicitly hid controls with B button - force hidden
      setIsVisible(false)
    } else if (!isPlaying || isHovered) {
      // Normal show conditions
      setIsVisible(true)
    }
  }, [userHidControls, isPlaying, isHovered])

  // Animate opacity with React Spring
  useSpring({
    opacity: isVisible ? 1 : 0,
    config: {
      tension: 500,
      friction: 150,
    },
    onChange: ({ value: { opacity } }: { value: { opacity: number } }) => {
      animatedOpacity.value = opacity
    },
    immediate: false,
    reset: true,
  })

  // Don't render if completely transparent
  if (animatedOpacity.value <= 0) return null

  return (
    <Container
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      {...containerProps}
    >
      <ControlPanelCard video={video} title={title} opacity={animatedOpacity} object3DName={object3DName} />
    </Container>
  )
}
