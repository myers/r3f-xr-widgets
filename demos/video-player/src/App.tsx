import { Canvas } from "@react-three/fiber"
import {
  PointerEvents,
  noEvents,
  createXRStore,
  XR,
} from "@react-three/xr"
import { EnterXRButton, HorizonWindow, EyeLevelGroup, DEFAULT_EYE_LEVEL, HorizonCursorMaterial, XRLayerSkybox, BlackBorderXRLayer, GridFloor, CylindricalBillboard, DebugExpose } from "r3f-xr-widgets"
import { useState } from "react"
import { VideoSelector, VideoOption } from "./VideoSelector"
import { VideoPlayerTitleBar } from "./VideoPlayerTitleBar"
import { VideoPlayerContent } from "./VideoPlayerContent"

const store = createXRStore({
  foveation: 0,
  layers: true,
  domOverlay: false,
  emulate: { inject: true },
  controller: {
    rayPointer: {
      cursorModel: {
        materialClass: HorizonCursorMaterial,
        size: 0.04,
        renderOrder: 999
      }
    }
  }
})

// Video library - use same thumbnail for all videos
const thumbnail = import.meta.env.BASE_URL + 'videos/bbb_sunflower_normal_thumb.jpg'

const videos: VideoOption[] = [
  {
    url: import.meta.env.BASE_URL + 'videos/bbb_sunflower_1080p_30fps_normal_10s.mp4',
    title: 'Normal',
    thumbnail,
    layout: 'mono'
  },
  {
    url: import.meta.env.BASE_URL + 'videos/bbb_sunflower_1080p_30fps_stereo_abl_10s.mp4',
    title: 'Stereo',
    thumbnail,
    layout: 'stereo-top-bottom'
  }
]

export function App() {
  const [viewMode, setViewMode] = useState<'selection' | 'playing'>('selection')
  const [selectedVideo, setSelectedVideo] = useState<VideoOption | null>(null)

  const handleVideoSelect = (video: VideoOption) => {
    console.log('[App] Video selected:', video.title, video.url)
    setSelectedVideo(video)
    setViewMode('playing')
  }

  const handleBack = () => {
    console.log('[App] Back to selection')
    setViewMode('selection')
    setSelectedVideo(null)
  }

  const handleClose = () => {
    console.log('[App] Close window')
    setViewMode('selection')
    setSelectedVideo(null)
  }

  return (
    <>
      <EnterXRButton store={store} mode="immersive-vr" id="enter-vr-btn" />
      <Canvas
        events={noEvents}
        style={{ width: "100%", flexGrow: 1 }}
        camera={{ position: [0, DEFAULT_EYE_LEVEL, 0], rotation: [0, 0, 0], fov: 50 }}
      >
        <PointerEvents />
        <XR store={store}>
          <DebugExpose store={store} />
          <XRLayerSkybox color="#333333" />
          <GridFloor />
          {/* Lighting setup */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <EyeLevelGroup defaultEyeLevel={DEFAULT_EYE_LEVEL}>
            <group position-z={-2.5}>
              <CylindricalBillboard>
                <HorizonWindow
                  width={1800}
                  height={1350}
                  pixelSize={0.001}
                  // minWidth={1800}
                  maxWidth={5400}
                  // minHeight={1200}
                  maxHeight={3600}
                  titleBar={
                    <VideoPlayerTitleBar
                      title={viewMode === 'selection' ? 'Select Video' : selectedVideo?.title || ''}
                      showBack={viewMode === 'playing'}
                      onBack={handleBack}
                      onClose={handleClose}
                    />
                  }
                >
                  {viewMode === 'selection' ? (
                    <VideoSelector videos={videos} onSelect={handleVideoSelect} />
                  ) : (
                    <BlackBorderXRLayer renderOrder={-100}>
                      <>
                        {selectedVideo && <VideoPlayerContent videoUrl={selectedVideo.url} title={selectedVideo.title} layout={selectedVideo.layout} />}
                      </>
                    </BlackBorderXRLayer>
                  )}
                </HorizonWindow>
              </CylindricalBillboard>
            </group>
          </EyeLevelGroup>
        </XR>
      </Canvas >
    </>
  )
}
