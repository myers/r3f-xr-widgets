import { Container, Content, Video, type ContainerProperties } from '@react-three/uikit'
import { XRLayer } from '@react-three/xr'
import { VideoXR } from './VideoXR'
import { ControlPanelAutoFade } from './ControlPanelAutoFade'
import { ActionIndicator } from './ActionIndicator'
import { useVideoXRControls, type PlaybackAction } from '../hooks/useVideoXRControls'

/**
 * Video rendering method
 * @group Types
 */
export type VideoRenderer = 'xrlayer' | 'videoxr' | 'uikit'

/**
 * Props for the QuadVideoPlayer component
 * @group Types
 */
export interface QuadVideoPlayerProps extends Omit<ContainerProperties, 'children'> {
  /** HTML video element to display and control. Required. */
  video: HTMLVideoElement

  /** Video rendering method. 'xrlayer' (default, best performance), 'videoxr' (auto-sizing), or 'uikit' (VideoTexture). @default 'xrlayer' */
  renderer?: VideoRenderer

  /** Aspect ratio (width/height) of the video display. @default 16/9 */
  aspectRatio?: number

  /** XRLayer layout mode for stereo videos. @default 'default' */
  layout?: 'default' | 'mono' | 'stereo-left-right' | 'stereo-top-bottom'

  /** Whether to show the control panel. @default true */
  showControls?: boolean

  /** Whether to show visual action indicators (play/pause/seek/buffering icons). @default true */
  showActionIndicator?: boolean

  /** Whether to enable XR controller button handling. @default true */
  enableXRControllers?: boolean

  /** Title text displayed in the control panel. When undefined, title is hidden and panel is shorter. @default undefined */
  controlPanelTitle?: string

  /** Positioning of the control panel overlay. @default { bottom: '5%', left: '16%', right: '16%' } */
  controlPanelPosition?: {
    bottom?: `${number}%` | number
    left?: `${number}%` | number
    right?: `${number}%` | number
  }

  /** Whether XR controller buttons require pointer to be on the video. @default true */
  requirePointerOnTarget?: boolean

  /** Callback fired when XR controller playback actions occur (play/pause/seek/toggle). */
  onPlaybackAction?: (action: PlaybackAction) => void

  /** Render order for XRLayer compositing. Higher values render on top. @default 0 */
  layerRenderOrder?: number
}

/**
 * A complete video player component with playback controls and XR controller support.
 *
 * Features:
 * - Three rendering modes: XRLayer (best performance), VideoXR (auto-sizing), or UIKit (VideoTexture)
 * - Playback control panel with play/pause, seek (±10s), volume, and progress slider
 * - Visual action indicators for play/pause/seek/buffering states
 * - Full XR controller integration with button mapping:
 *   - A button: Play/pause
 *   - B button: Toggle controls visibility
 *   - Right thumbstick right: Seek forward 10s
 *   - Right thumbstick left: Seek backward 10s
 * - Auto-hiding controls with smart hover detection (hides after 3s when playing, unless pointer on controls)
 * - Configurable control panel positioning
 *
 * @group Components
 *
 * @example Basic usage
 * ```tsx
 * import { QuadVideoPlayer } from 'r3f-xr-widgets'
 *
 * const video = document.createElement('video')
 * video.src = '/path/to/video.mp4'
 * video.load()
 *
 * <QuadVideoPlayer
 *   video={video}
 *   renderer="xrlayer"
 *   controlPanelTitle="My Video"
 * />
 * ```
 *
 * @example With XR controller callbacks
 * ```tsx
 * <QuadVideoPlayer
 *   video={video}
 *   onPlaybackAction={(action) => console.log('Action:', action.type)}
 *   onControlsToggle={() => console.log('Controls toggled')}
 * />
 * ```
 *
 * @example Using VideoXR renderer with custom aspect ratio
 * ```tsx
 * <QuadVideoPlayer
 *   video={video}
 *   renderer="videoxr"  // Auto-sizing renderer
 *   aspectRatio={21/9}  // Ultra-wide
 * />
 * ```
 *
 * @example In a Fullscreen container
 * ```tsx
 * <Fullscreen>
 *   <QuadVideoPlayer
 *     video={video}
 *     renderer="uikit"
 *   />
 * </Fullscreen>
 * ```
 */
export function QuadVideoPlayer(allProps: QuadVideoPlayerProps) {
  const {
    video,
    renderer = 'xrlayer',
    aspectRatio = 16 / 9,
    layout = 'default',
    showControls = true,
    showActionIndicator = true,
    enableXRControllers = true,
    controlPanelTitle,
    controlPanelPosition = {
      bottom: '5%' as `${number}%`,
      left: '16%' as `${number}%`,
      right: '16%' as `${number}%`
    },
    requirePointerOnTarget = true,
    onPlaybackAction,
    layerRenderOrder = 0,
    ...containerProps
  } = allProps
  // Use XR controller hook for controller input (conditionally)
  const xrControls = enableXRControllers ? useVideoXRControls({
    video,
    requirePointerOnTarget,
    onAction: onPlaybackAction
  }) : null

  // Extract values from xrControls (if enabled)
  const toggleControlsRef = xrControls?.toggleControlsRef
  const xrPointerHandlers = xrControls ? {
    onPointerEnter: xrControls.onPointerEnter,
    onPointerLeave: xrControls.onPointerLeave
  } : {
    onPointerEnter: () => {},
    onPointerLeave: () => {}
  }

  // Handler for clicking on video to toggle play/pause
  const handleVideoClick = (e?: any) => {
    e?.stopPropagation?.()
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  // Render based on selected renderer type
  if (renderer === 'videoxr') {
    // Use VideoXR component (XRLayer-based but as a UIkit component)
    return (
      <Container
        width="100%"
        positionType="relative"
        {...xrPointerHandlers}
        {...containerProps}
      >
        <VideoXR
          src={video}
          width="100%"
          aspectRatio={aspectRatio}
          layout={layout}
          controls={false}
          onClick={handleVideoClick}
          renderOrder={layerRenderOrder}
        />

        {/* Action Indicator - centered over video for visual feedback */}
        {showActionIndicator && (
          <Container
            positionType="absolute"
            positionTop="50%"
            positionLeft="50%"
            transformTranslateX="-50%"
            transformTranslateY="-50%"
            transformTranslateZ={0.01}
            pointerEvents="none"
            renderOrder={1}
          >
            <ActionIndicator video={video} />
          </Container>
        )}

        {/* Control Panel - positioned absolutely */}
        {showControls && (
          <Container
            positionType="absolute"
            positionBottom={controlPanelPosition.bottom}
            positionLeft={controlPanelPosition.left}
            positionRight={controlPanelPosition.right}
            flexDirection="row"
            transformTranslateZ={0.01}
            renderOrder={2}
          >
            <ControlPanelAutoFade
              video={video}
              title={controlPanelTitle}
              toggleRef={toggleControlsRef}
            />
          </Container>
        )}
      </Container>
    )
  } else if (renderer === 'uikit') {
    // Use UIkit's Video component (VideoTexture-based)
    return (
      <Container
        width="100%"
        positionType="relative"
        {...xrPointerHandlers}
        {...containerProps}
      >
        <Video
          src={video}
          width="100%"
          aspectRatio={aspectRatio}
          controls={false}
          onClick={handleVideoClick}
        />

        {/* Action Indicator - centered over video for visual feedback */}
        {showActionIndicator && (
          <Container
            positionType="absolute"
            positionTop="50%"
            positionLeft="50%"
            transformTranslateX="-50%"
            transformTranslateY="-50%"
            transformTranslateZ={0.01}
            pointerEvents="none"
            renderOrder={1}
          >
            <ActionIndicator video={video} />
          </Container>
        )}

        {/* Control Panel - positioned absolutely */}
        {showControls && (
          <Container
            positionType="absolute"
            positionBottom={controlPanelPosition.bottom}
            positionLeft={controlPanelPosition.left}
            positionRight={controlPanelPosition.right}
            flexDirection="row"
            transformTranslateZ={0.01}
            renderOrder={2}
          >
            <ControlPanelAutoFade
              video={video}
              title={controlPanelTitle}
              toggleRef={toggleControlsRef}
            />
          </Container>
        )}
      </Container>
    )
  } else {
    // Default: Use XRLayer directly in Content (original approach)
    return (
      <Container
        flexDirection="column"
        aspectRatio={aspectRatio}
        width="100%"
        positionType="relative"
        {...xrPointerHandlers}
        {...containerProps}
      >
        {/* Video Layer - use XRLayer */}
        <Container flexGrow={1} onClick={handleVideoClick}>
          <Content flexGrow={1} keepAspectRatio={false}>
            <XRLayer
              src={video}
              shape="quad"
              pixelWidth={960}
              pixelHeight={540}
              scale={[1, 1, 1]}
              renderOrder={layerRenderOrder}
            />
          </Content>
        </Container>

        {/* Action Indicator - centered over video for visual feedback */}
        {showActionIndicator && (
          <Container
            positionType="absolute"
            positionTop="50%"
            positionLeft="50%"
            transformTranslateX="-50%"
            transformTranslateY="-50%"
            transformTranslateZ={0.01}
            pointerEvents="none"
            renderOrder={1}
          >
            <ActionIndicator video={video} />
          </Container>
        )}

        {/* Control Panel - positioned absolutely */}
        {showControls && (
          <Container
            positionType="absolute"
            positionBottom={controlPanelPosition.bottom}
            positionLeft={controlPanelPosition.left}
            positionRight={controlPanelPosition.right}
            flexDirection="row"
            transformTranslateZ={0.01}
            renderOrder={2}
          >
            <ControlPanelAutoFade
              video={video}
              title={controlPanelTitle}
              toggleRef={toggleControlsRef}
            />
          </Container>
        )}
      </Container>
    )
  }
}
