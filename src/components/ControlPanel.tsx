import { Container, Text } from "@react-three/uikit"
import { VideoSlider } from "./VideoSlider"
import { VolumeControl } from "./VolumeControl"
import { useMemo, useState, useEffect } from "react"
import { computed, signal, Signal } from "@preact/signals-core"
import { useFrame } from "@react-three/fiber"
import { Play, Pause, FastForward, Rewind } from "@react-three/uikit-lucide"

// Constants
const SEEK_SECONDS = 10
const ICON_SIZE_SMALL = 24
const ICON_SIZE_LARGE = 48
const FONT_SIZE_SMALL = 14
const FONT_SIZE_TITLE = 16
const CARD_HEIGHT_WITH_TITLE = 110
const CARD_HEIGHT_WITHOUT_TITLE = 84

/**
 * Props for the ControlPanel component
 * @group Types
 */
export type ControlPanelProps = {
  video?: HTMLVideoElement
  title?: string
  object3DName?: string
}

/**
 * Props for the ControlPanelCard component
 * @group Types
 */
export type ControlPanelCardProps = ControlPanelProps & {
  opacity?: number | Signal<number>
}

function formatDuration(seconds: number) {
  if (!isFinite(seconds)) return "0:00"
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
  const { video, title, object3DName = 'control-panel' } = props
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

  const handlePlayPause = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.()
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleRewind = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.()
    if (!video) return
    video.currentTime = Math.max(0, video.currentTime - SEEK_SECONDS)
  }

  const handleFastForward = (e?: { stopPropagation?: () => void }) => {
    e?.stopPropagation?.()
    if (!video) return
    video.currentTime = Math.min(video.duration, video.currentTime + SEEK_SECONDS)
  }

  return (
    <Container
      flexGrow={1}
      flexDirection="column"
      gap={10}
      margin={15}
    >
      {title && (
        <Container object3DName={`${object3DName}-title`}>
          <Text fontSize={FONT_SIZE_TITLE} color="white" textAlign="left" fontWeight="bold">
            {title}
          </Text>
        </Container>
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
          <Container cursor="pointer" onClick={handleRewind} padding={8} object3DName={`${object3DName}-rewind`}>
            <Rewind
              color="white"
              width={ICON_SIZE_SMALL}
              height={ICON_SIZE_SMALL}
            />
          </Container>
          <Container
            cursor="pointer"
            onClick={handlePlayPause}
            padding={8}
            object3DName={`${object3DName}-play-pause`}
          >
            {paused
              ? <Play color="white" width={ICON_SIZE_LARGE} height={ICON_SIZE_LARGE} />
              : <Pause color="white" width={ICON_SIZE_LARGE} height={ICON_SIZE_LARGE} />
            }
          </Container>
          <Container cursor="pointer" onClick={handleFastForward} padding={8} object3DName={`${object3DName}-fast-forward`}>
            <FastForward
              color="white"
              width={ICON_SIZE_SMALL}
              height={ICON_SIZE_SMALL}
            />
          </Container>
        </Container>

        {/* Right section - Empty space to balance 3-column layout */}
        <Container width="33%" />
      </Container>
      <Container flexDirection="row" alignItems="center" gap={16}>
        <Text fontSize={FONT_SIZE_SMALL} color="white" flexGrow={0} width={50}>
          {timeText}
        </Text>
        <VideoSlider media={video} flexGrow={1} />
        <Text fontSize={FONT_SIZE_SMALL} color="white" flexGrow={0} width={50}>
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
  const height = title ? CARD_HEIGHT_WITH_TITLE : CARD_HEIGHT_WITHOUT_TITLE

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
