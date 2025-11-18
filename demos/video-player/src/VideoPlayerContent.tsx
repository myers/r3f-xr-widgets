import { useEffect, useMemo } from 'react'
import { QuadVideoPlayer } from 'r3f-xr-widgets'

export interface VideoPlayerContentProps {
  videoUrl: string
  title?: string
}

export function VideoPlayerContent({ videoUrl, title }: VideoPlayerContentProps) {
  // Create video element
  const videoElement = useMemo(() => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.playsInline = true
    video.muted = false
    return video
  }, [])

  // Update video source when URL changes
  useEffect(() => {
    console.log('[VideoPlayerContent] Loading video:', videoUrl)
    videoElement.src = videoUrl
    videoElement.load()

    // Auto-play when loaded
    const handleLoadedData = () => {
      console.log('[VideoPlayerContent] Video loaded, attempting to play')
      videoElement.play().catch((err) => {
        console.error('[VideoPlayerContent] Autoplay failed:', err)
      })
    }

    videoElement.addEventListener('loadeddata', handleLoadedData)

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData)
      videoElement.pause()
      videoElement.src = ''
    }
  }, [videoUrl, videoElement])

  return (
    <QuadVideoPlayer
      video={videoElement}
      renderer="videoxr"
      showControls={true}
      showActionIndicator={true}
      enableXRControllers={true}
      controlPanelTitle={title || ''}
      xrRequirePointer={true}
      width="100%"
      flexGrow={1}
    />
  )
}
