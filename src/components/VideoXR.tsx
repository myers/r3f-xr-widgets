import { Container, Content, type ContainerProperties } from '@react-three/uikit'
import { XRLayer } from '@react-three/xr'
import { useState, useEffect, useMemo } from 'react'
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:components:video-xr')

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
}

/**
 * Video component that renders using XRLayer with auto-sizing
 * @group Components
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
    ...containerProps
  } = allProps
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

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
    return video
  }, [src])

  // Apply video properties
  useEffect(() => {
    if (!videoElement) return

    videoElement.volume = volume
    videoElement.muted = muted
    videoElement.loop = loop
    videoElement.autoplay = autoplay
    if (crossOrigin !== null) {
      videoElement.crossOrigin = crossOrigin
    }
    videoElement.preservesPitch = preservesPitch
    videoElement.playbackRate = playbackRate
  }, [videoElement, volume, muted, loop, autoplay, crossOrigin, preservesPitch, playbackRate])

  // Handle metadata loading to get video dimensions
  useEffect(() => {
    if (!videoElement) return

    const handleLoadedMetadata = () => {
      if (videoElement.videoWidth && videoElement.videoHeight) {
        setVideoDimensions({
          width: videoElement.videoWidth,
          height: videoElement.videoHeight
        })
        debug('VideoXR: Video dimensions loaded', {
          width: videoElement.videoWidth,
          height: videoElement.videoHeight
        })
      }
    }

    // Add event listener
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Check if metadata is already loaded
    if (videoElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata()
    }

    // Cleanup
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [videoElement])

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
