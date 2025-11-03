import { Container, Root, Text } from "@react-three/uikit"
import { VideoSlider } from "./VideoSlider"
import { VolumeControl } from "./VolumeControl"
import { useMemo, useState, useEffect } from "react"
import { computed, signal } from "@preact/signals-core"
import { useFrame } from "@react-three/fiber"
import { Play, Pause, FastForward, Rewind } from "@react-three/uikit-lucide"

export type ControlPanelProps = {
  video?: HTMLVideoElement
  title?: string
}

export const ControlPanelRoot = (props: ControlPanelProps) => {
  return (
    <group rotation={[-0.3, 0, 0]} position={[0, 0.35, -0.25]} scale={0.25}>
      <Root
        backgroundColor="black"
        padding={0}
        margin={0}
        borderRadius={10}
        sizeX={5}
        sizeY={1.5}
        flexDirection="row"
      >
        <ControlPanel {...props} />
      </Root>
    </group>
  )
}

function formatDuration(seconds: number) {
  const hour = Math.floor(seconds / 3600)
  const min = Math.floor((seconds / 60) % 60)
  const sec = Math.floor(seconds % 60)
  return `${hour > 0 ? `${hour}:` : ""}${hour > 0 ? min.toString().padStart(2, "0") : min}:${sec.toString().padStart(2, "0")}`
}

export const ControlPanel = ({ video, title }: ControlPanelProps) => {
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

  const handlePlayPause = () => {
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleRewind = () => {
    if (!video) return
    video.currentTime = Math.max(0, video.currentTime - 10)
  }

  const handleFastForward = () => {
    if (!video) return
    video.currentTime = Math.min(video.duration, video.currentTime + 10)
  }

  return (
    <Container
      flexGrow={1}
      backgroundColor="black"
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
          <Container cursor="pointer">
            <Rewind
              color="white"
              width={24}
              height={24}
              onClick={handleRewind}
            />
          </Container>
          <Container cursor="pointer">
            {paused ? (
              <Play
                color="white"
                width={48}
                height={48}
                onClick={handlePlayPause}
              />
            ) : (
              <Pause
                color="white"
                width={48}
                height={48}
                onClick={handlePlayPause}
              />
            )}
          </Container>
          <Container cursor="pointer">
            <FastForward
              color="white"
              width={24}
              height={24}
              onClick={handleFastForward}
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
