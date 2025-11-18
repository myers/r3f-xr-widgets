import {
  Container,
  type VanillaContainer,
  type ContainerProperties,
} from "@react-three/uikit"
import { VolumeX, Volume2 } from "@react-three/uikit-lucide"
import { Slider } from "@react-three/uikit-default"
import {
  type ReactNode,
  type RefAttributes,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react"
import { signal } from "@preact/signals-core"

/**
 * Props for the VolumeControl component
 * @group Types
 */
export type VolumeControlProperties = {
  video?: HTMLVideoElement
  muteButtonName?: string
} & Omit<ContainerProperties, "children">

/**
 * Volume control component with mute button and slider
 * @group Components
 */
export const VolumeControl: (
  props: VolumeControlProperties & RefAttributes<VanillaContainer>,
) => ReactNode = forwardRef(({ video, muteButtonName, ...props }, ref) => {
  const [muted, setMuted] = useState(false)
  const volumeSignal = useMemo(() => signal(1), [])

  useEffect(() => {
    if (!video) return

    const handleVolumeChange = () => {
      setMuted(video.muted)
      volumeSignal.value = video.muted ? 0 : video.volume
    }

    video.addEventListener("volumechange", handleVolumeChange)
    return () => video.removeEventListener("volumechange", handleVolumeChange)
  }, [video, volumeSignal])

  const internalRef = useRef<VanillaContainer>(null)
  useImperativeHandle(ref, () => internalRef.current!)

  const toggleMute = (e?: any) => {
    e?.stopPropagation?.()
    if (!video) return
    video.muted = !video.muted
    volumeSignal.value = video.muted ? 0 : video.volume
    setMuted(!muted)
  }

  const handleVolumeChange = (value: number) => {
    if (!video) return
    if (value > 0) {
      video.muted = false
      setMuted(false)
    } else if (value === 0) {
      video.muted = true
      setMuted(true)
    }
    video.volume = value
    volumeSignal.value = value
  }

  return (
    <Container
      flexDirection="row"
      alignItems="center"
      gap={0}
      height={24}
      {...props}
      ref={internalRef}
      padding={5}
    >
      <Container
        cursor="pointer"
        onClick={toggleMute}
        padding={8}
        name={muteButtonName}
      >
        {(() => {
          const VolumeIcon = muted ? VolumeX : Volume2
          return <VolumeIcon color="white" width={24} height={24} />
        })()}
      </Container>
      <Slider
        width={100}
        min={0}
        max={1}
        step={0.01}
        value={volumeSignal}
        onValueChange={handleVolumeChange}
        transformScale={0.7}
      />
    </Container>
  )
})
