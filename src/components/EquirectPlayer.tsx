import { XRLayer } from "@react-three/xr"
import { useMemo, useEffect } from "react"
import { type ControlPanelProps } from "./ControlPanel"
import { ControlPanelAutoFade } from "./ControlPanelAutoFade"
import { Container } from "@react-three/uikit"
import { ActionIndicator } from "./ActionIndicator"
import { useVideoXRControls } from "../hooks/useVideoXRControls"
import { useVideoMetadata } from "../hooks/useVideoMetadata"

// Control panel positioning constants
const CONTROL_PANEL_ROTATION_X = -0.3 // Tilt towards user
const CONTROL_PANEL_POSITION: [number, number, number] = [0, 0.35, -0.25]
const CONTROL_PANEL_SCALE = 0.25
const CONTROL_PANEL_SIZE_X = 5
const CONTROL_PANEL_SIZE_Y = 1.5

// Action indicator positioning
const ACTION_INDICATOR_POSITION: [number, number, number] = [0, 1, -1]

// XRLayer scale for equirect projection
const EQUIRECT_LAYER_SCALE = 100

interface ControlPanelRootProps extends ControlPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Container from uikit has different ref type than Object3D
  targetRef?: React.Ref<any>
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  toggleRef?: React.MutableRefObject<(() => void) | null>
}

const ControlPanelRoot = ({ video, targetRef, onPointerEnter, onPointerLeave, toggleRef, object3DName, ...props }: ControlPanelRootProps) => {
  if (!video) return null
  return (
    <group
      name={object3DName}
      rotation={[CONTROL_PANEL_ROTATION_X, 0, 0]}
      position={CONTROL_PANEL_POSITION}
      scale={CONTROL_PANEL_SCALE}
    >
      <Container
        ref={targetRef}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        sizeX={CONTROL_PANEL_SIZE_X}
        sizeY={CONTROL_PANEL_SIZE_Y}
      >
        <ControlPanelAutoFade video={video} toggleRef={toggleRef} object3DName={object3DName} {...props} />
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
  /** Name for the Three.js object for scene queries @default "equirect-player" */
  object3DName?: string
  /** If true, video starts playing automatically when component mounts @default false */
  autoPlay?: boolean
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
  const {
    title,
    videoUrl,
    videoAngle = 180,
    layout = "stereo-left-right",
    object3DName = "equirect-player",
    autoPlay = false
  } = props

  const video: HTMLVideoElement = useMemo(() => {
    const videoElement = document.createElement("video")
    videoElement.src = videoUrl
    videoElement.crossOrigin = "anonymous"
    videoElement.preload = "auto"
    return videoElement
  }, [videoUrl])

  // Cleanup video element on unmount or when videoUrl changes
  useEffect(() => {
    return () => {
      video.pause()
      video.removeAttribute("src")
      video.load()
    }
  }, [video])

  // Auto-play video when autoPlay prop is true
  useEffect(() => {
    if (autoPlay && video) {
      video.play().catch((err) => {
        console.warn('[EquirectPlayer] Autoplay failed:', err)
      })
    }
  }, [autoPlay, video])

  const videoDimensions = useVideoMetadata(video)

  const { targetRef, onPointerEnter, onPointerLeave, toggleControlsRef } = useVideoXRControls({
    video,
    requirePointerOnTarget: false, // Match original global behavior
  })

  // Derive internal names from root object3DName
  const layerName = `${object3DName}-layer`
  const actionIndicatorName = `${object3DName}-action-indicator`
  const controlPanelName = `${object3DName}-control-panel`

  return (
    <group name={object3DName}>
      {videoDimensions && (
        <XRLayer
          name={layerName}
          src={video}
          layout={layout}
          shape="equirect"
          centralHorizontalAngle={(Math.PI * videoAngle) / 180}
          upperVerticalAngle={Math.PI / 2.0}
          lowerVerticalAngle={-Math.PI / 2.0}
          pixelWidth={videoDimensions.width}
          pixelHeight={videoDimensions.height}
          scale={EQUIRECT_LAYER_SCALE}
        />
      )}
      <group name={actionIndicatorName} position={ACTION_INDICATOR_POSITION}>
        <ActionIndicator video={video} object3DName={`${actionIndicatorName}-icon`} />
      </group>
      <ControlPanelRoot
        video={video}
        title={title}
        targetRef={targetRef}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        toggleRef={toggleControlsRef}
        object3DName={controlPanelName}
      />
    </group>
  )
}
