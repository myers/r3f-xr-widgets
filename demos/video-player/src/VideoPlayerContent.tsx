import { useEffect, useMemo } from 'react'
import { QuadVideoPlayer } from 'r3f-xr-widgets'

export interface VideoPlayerContentProps {
  videoUrl: string
  title?: string
  layout: 'default' | 'mono' | 'stereo-left-right' | 'stereo-top-bottom'
}

export function VideoPlayerContent({ videoUrl, title, layout }: VideoPlayerContentProps) {
  // Create video element
  const videoElement = useMemo(() => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.playsInline = true
    video.muted = true // Muted for autoplay policy
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
      layout={layout}
      showControls={true}
      showActionIndicator={true}
      enableXRControllers={true}
      controlPanelTitle={title || ''}
      requirePointerOnTarget={true}
      width="100%"
    // pixelSize={0.004}
    />
  )
}
