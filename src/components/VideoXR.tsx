import { Container, Content, type ContainerProperties } from '@react-three/uikit'
import { XRLayer } from '@react-three/xr'
import { useMemo } from 'react'
import { useVideoMetadata } from '../hooks/useVideoMetadata'

/**
 * Props for the VideoXR component
 * @group Types
 */
export interface VideoXRProperties extends Omit<ContainerProperties, 'children'> {
  src?: string | HTMLVideoElement
  controls?: boolean
  volume?: number
  muted?: boolean
  loop?: boolean
  autoplay?: boolean
  crossOrigin?: string | null
  preservesPitch?: boolean
  playbackRate?: number

  // XRLayer specific
  shape?: 'quad' | 'cylinder' | 'equirect'
  layout?: 'default' | 'mono' | 'stereo-left-right' | 'stereo-top-bottom'
  /** Render order for XRLayer compositing. Higher values render on top. @default 0 */
  renderOrder?: number
}

/**
 * Video player that wraps XRLayer in UIKit's Content component.
 *
 * Waits for video metadata to load, then creates an XRLayer sized to the video's
 * actual dimensions (pixelWidth, pixelHeight). This ensures correct aspect ratio
 * and integrates with UIKit's layout system.
 *
 * Use this instead of raw XRLayer when you need UIKit layout integration.
 * For 360° videos, see EquirectPlayer which uses raw XRLayer.
 *
 * @group Components
 *
 * @example
 * ```tsx
 * <VideoXR src="/video.mp4" shape="quad" flexGrow={1} />
 * ```
 *
 * @see {@link useVideoMetadata} - Hook used internally to get video dimensions
 * @see {@link EquirectPlayer} - For 360° videos (uses raw XRLayer)
 */
export function VideoXR(allProps: VideoXRProperties) {
  const {
    src,
    controls = false,  // Default to false to match current usage
    volume = 1,
    muted = false,
    loop = false,
    autoplay = false,
    crossOrigin = 'anonymous',
    preservesPitch = true,
    playbackRate = 1,
    shape = 'quad',
    layout = 'default',
    renderOrder = 0,
    ...containerProps
  } = allProps

  // Create or use provided video element
  const videoElement = useMemo(() => {
    if (src instanceof HTMLVideoElement) {
      return src
    }

    const video = document.createElement('video')
    video.playsInline = true
    if (typeof src === 'string') {
      video.src = src
    }
    video.volume = volume
    video.muted = muted
    video.loop = loop
    video.autoplay = autoplay
    if (crossOrigin !== null) {
      video.crossOrigin = crossOrigin
    }
    video.preservesPitch = preservesPitch
    video.playbackRate = playbackRate
    return video
  }, [src, volume, muted, loop, autoplay, crossOrigin, preservesPitch, playbackRate])

  // Wait for video metadata to get dimensions
  const videoDimensions = useVideoMetadata(videoElement)

  // Calculate aspect ratio from video dimensions
  const aspectRatio = videoDimensions
    ? videoDimensions.width / videoDimensions.height
    : containerProps.aspectRatio || 16/9

  return (
    <Container
      {...containerProps}
      aspectRatio={aspectRatio}
      positionType="relative"
    >
      {/* Video rendering via XRLayer */}
      <Content flexGrow={1} keepAspectRatio={false}>
        {videoDimensions ? (
          <XRLayer
            src={videoElement}
            shape={shape}
            layout={layout}
            pixelWidth={videoDimensions.width}
            pixelHeight={videoDimensions.height}
            scale={[1, 1, 1]}
            renderOrder={renderOrder}
          />
        ) : (
          // Placeholder while loading - could show a loading indicator here
          null
        )}
      </Content>

      {/* Controls would go here if enabled */}
      {controls && (
        <Container
          positionType="absolute"
          positionBottom={0}
          positionLeft={0}
          positionRight={0}
          padding={8}
          backgroundColor="rgba(0,0,0,0.5)"
        >
          {/* TODO: Add video controls UI here */}
          {/* For now, controls are disabled and custom controls are used */}
        </Container>
      )}
    </Container>
  )
}
