import { Container, Text } from "@react-three/uikit"
// import { Button } from "@react-three/uikit-default"
import { VideoSlider } from "./VideoSlider"
import { VolumeControl } from "./VolumeControl"
import { useMemo, useState, useEffect } from "react"
import { computed, signal } from "@preact/signals-core"
import { useFrame } from "@react-three/fiber"
import { Play, Pause, FastForward, Rewind } from "@react-three/uikit-lucide"

/**
 * Props for the ControlPanel component
 * @group Types
 */
export type ControlPanelProps = {
  video?: HTMLVideoElement
  title?: string
}

/**
 * Props for the ControlPanelCard component
 * @group Types
 */
export type ControlPanelCardProps = ControlPanelProps & {
  opacity?: any // Signal or number for opacity
}

function formatDuration(seconds: number) {
  const hour = Math.floor(seconds / 3600)
  const min = Math.floor((seconds / 60) % 60)
  const sec = Math.floor(seconds % 60)
  return `${hour > 0 ? `${hour}:` : ""}${hour > 0 ? min.toString().padStart(2, "0") : min}:${sec.toString().padStart(2, "0")}`
}

/**
 * Video player control panel with playback controls and time display
 * @group Components
 */
export const ControlPanel = (props: ControlPanelProps) => {
  const { video, title } = props
  const timeSignal = useMemo(() => signal(0), [])
  const durationSignal = useMemo(() => signal(0), [])
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    if (!video) return

    const handlePlay = () => setPaused(false)
    const handlePause = () => setPaused(true)

    // Set initial state
    setPaused(video.paused)

    // Add event listeners
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)

    // Cleanup
    return () => {
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
    }
  }, [video])

  useFrame(() => {
    if (!video) return
    timeSignal.value = video.currentTime
    durationSignal.value = video.duration
  })

  const timeText = useMemo(
    () => computed(() => formatDuration(timeSignal.value)),
    [timeSignal],
  )

  const durationText = useMemo(
    () => computed(() => formatDuration(durationSignal.value)),
    [durationSignal],
  )

  const handlePlayPause = (e?: any) => {
    e?.stopPropagation?.()
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleRewind = (e?: any) => {
    e?.stopPropagation?.()
    if (!video) return
    video.currentTime = Math.max(0, video.currentTime - 10)
  }

  const handleFastForward = (e?: any) => {
    e?.stopPropagation?.()
    if (!video) return
    video.currentTime = Math.min(video.duration, video.currentTime + 10)
  }

  return (
    <Container
      flexGrow={1}
      flexDirection="column"
      gap={10}
      margin={15}
    >
      {title && (
        <Text fontSize={16} color="white" textAlign="left" fontWeight="bold">
          {title}
        </Text>
      )}
      <Container
        flexDirection="row"
        alignItems="center"
        gap={16}
        justifyContent="space-between"
      >
        {/* Left section - Volume control */}
        <Container width="33%">
          <VolumeControl video={video} />
        </Container>

        {/* Center section - Playback controls */}
        <Container
          flexDirection="row"
          gap={16}
          alignItems="center"
          width="33%"
          justifyContent="center"
        >
          <Container cursor="pointer" onClick={handleRewind} padding={8}>
            <Rewind
              color="white"
              width={24}
              height={24}
            />
          </Container>
          <Container
            cursor="pointer"
            onClick={handlePlayPause}
            padding={8}
          >
            {(() => {
              const PlayPauseIcon = paused ? Play : Pause
              return <PlayPauseIcon color="white" width={48} height={48} />
            })()}
          </Container>
          <Container cursor="pointer" onClick={handleFastForward} padding={8}>
            <FastForward
              color="white"
              width={24}
              height={24}
            />
          </Container>
        </Container>

        {/* Right section - Empty space */}
        <Container width="33%" />
      </Container>
      <Container flexDirection="row" alignItems="center" gap={16}>
        <Text fontSize={14} color="white" flexGrow={0} width={50}>
          {timeText}
        </Text>
        <VideoSlider media={video} flexGrow={1} />
        <Text fontSize={14} color="white" flexGrow={0} width={50}>
          {durationText}
        </Text>
      </Container>
    </Container>
  )
}

/**
 * Styled card wrapper for ControlPanel with background and opacity
 * @group Components
 */
export const ControlPanelCard = (allProps: ControlPanelCardProps) => {
  const { opacity = 0.9, title, ...props } = allProps
  // Dynamic height: 110px with title, 84px without (saves title row + gap)
  const height = title ? 110 : 84

  return (
    <Container
      backgroundColor="black"
      opacity={opacity}
      padding={0}
      margin={0}
      borderRadius={10}
      flexDirection="row"
      flexGrow={1}
      height={height}
    >
      <ControlPanel title={title} {...props} />
    </Container>
  )
}
