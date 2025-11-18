import { XRLayer } from "@react-three/xr"
import { useMemo } from "react"
import { type ControlPanelProps } from "./ControlPanel"
import { ControlPanelAutoFade } from "./ControlPanelAutoFade"
import { Container } from "@react-three/uikit"
import { ActionIndicator } from "./ActionIndicator"
import { useVideoXRControls } from "../hooks/useVideoXRControls"

interface ControlPanelRootProps extends ControlPanelProps {
  targetRef?: React.Ref<any>
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  toggleRef?: React.MutableRefObject<(() => void) | null>
}

const ControlPanelRoot = ({ video, targetRef, onPointerEnter, onPointerLeave, toggleRef, ...props }: ControlPanelRootProps) => {
  if (!video) return null
  return (
    <group rotation={[-0.3, 0, 0]} position={[0, 0.35, -0.25]} scale={0.25}>
      <Container
        ref={targetRef}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        sizeX={5}
        sizeY={1.5}>
        <ControlPanelAutoFade video={video} toggleRef={toggleRef} {...props} />
      </Container>
    </group>
  )
}

/**
 * Props for the EquirectPlayer component
 * @group Types
 */
export interface EquirectPlayerProps {
  /** Optional title displayed in the control panel */
  title?: string
  /** URL of the video file to play */
  videoUrl: string
  /** Horizontal field of view angle in degrees @default 180 */
  videoAngle?: number
  /** XR layer layout for stereoscopic/monoscopic rendering @default "stereo-left-right" */
  layout?: XRLayerLayout
}

/**
 * 360-degree equirectangular video player with XR controls
 *
 * Renders a 360/180-degree video using XRLayer for optimal performance in VR/AR.
 * Includes a floating control panel with play/pause, volume, scrubbing, and visual
 * playback indicators.
 *
 * The video is rendered as an equirectangular projection (sphere mapping) and supports
 * both stereoscopic (side-by-side, top-bottom) and monoscopic layouts.
 *
 * @group Components
 *
 * @example Basic 360° video player
 * ```tsx
 * import { EquirectPlayer } from 'r3f-xr-widgets'
 *
 * <EquirectPlayer
 *   title="My 360 Video"
 *   videoUrl="/videos/360-video.mp4"
 *   videoAngle={360}
 *   layout="mono"
 * />
 * ```
 *
 * @example 180° stereoscopic video (typical for VR180)
 * ```tsx
 * <EquirectPlayer
 *   title="VR180 Experience"
 *   videoUrl="/videos/vr180.mp4"
 *   videoAngle={180}
 *   layout="stereo-left-right"
 * />
 * ```
 *
 * @see {@link useVideoXRControls} for the XR controls hook used internally
 */
export function EquirectPlayer(props: EquirectPlayerProps) {
  const { title, videoUrl, videoAngle = 180, layout = "stereo-left-right" } = props
  const video: HTMLVideoElement = useMemo(() => {
    const videoElement = document.createElement("video")
    videoElement.src = videoUrl
    videoElement.crossOrigin = "anonymous"
    videoElement.preload = "auto"
    return videoElement
  }, [videoUrl])

  const { targetRef, onPointerEnter, onPointerLeave, toggleControlsRef } = useVideoXRControls({
    video,
    requirePointerOnTarget: false, // Match original global behavior
  })

  return (
    <group>
      <XRLayer
        src={video}
        layout={layout}
        shape="equirect"
        centralHorizontalAngle={(Math.PI * videoAngle) / 180}
        upperVerticalAngle={Math.PI / 2.0}
        lowerVerticalAngle={-Math.PI / 2.0}
        scale={100}
      />
      <group position={[0, 1, -1]}>
        <ActionIndicator video={video} />
      </group>
      <ControlPanelRoot
        video={video}
        title={title}
        targetRef={targetRef}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        toggleRef={toggleControlsRef}
      />
    </group>
  )
}
