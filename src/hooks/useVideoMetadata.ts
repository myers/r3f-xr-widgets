import { useState, useEffect } from 'react'

/**
 * Video dimensions returned by useVideoMetadata
 * @group Types
 */
export interface VideoDimensions {
  width: number
  height: number
}

/**
 * Loads video metadata and returns dimensions.
 *
 * Waits for the video's 'loadedmetadata' event to get the actual
 * video dimensions (videoWidth, videoHeight). Returns null until loaded.
 *
 * @param video - HTMLVideoElement to monitor
 * @returns Video dimensions or null if not loaded yet
 *
 * @example
 * ```tsx
 * const video = useMemo(() => {
 *   const el = document.createElement('video')
 *   el.src = '/video.mp4'
 *   return el
 * }, [])
 *
 * const dimensions = useVideoMetadata(video)
 *
 * return dimensions ? (
 *   <XRLayer
 *     src={video}
 *     pixelWidth={dimensions.width}
 *     pixelHeight={dimensions.height}
 *   />
 * ) : null
 * ```
 *
 * @group Hooks
 */
export function useVideoMetadata(video: HTMLVideoElement | undefined): VideoDimensions | null {
  const [videoDimensions, setVideoDimensions] = useState<VideoDimensions | null>(null)

  useEffect(() => {
    if (!video) {
      setVideoDimensions(null)
      return
    }

    // Reset dimensions when video changes
    setVideoDimensions(null)

    const handleLoadedMetadata = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoDimensions({
          width: video.videoWidth,
          height: video.videoHeight
        })
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Check if metadata is already loaded
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [video])

  return videoDimensions
}
