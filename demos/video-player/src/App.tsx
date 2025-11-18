import { Canvas } from "@react-three/fiber"
import {
  PointerEvents,
  noEvents,
  createXRStore,
  XR,
  IfInSessionMode,
} from "@react-three/xr"
import { Container } from "@react-three/uikit"
import { SplashScreen, GitHubBadge, HorizonWindow, EyeLevelGroup, DEFAULT_EYE_LEVEL, HorizonCursorMaterial, GridFloor } from "r3f-xr-widgets"
import { useState } from "react"
import { VideoSelector, VideoOption } from "./VideoSelector"
import { VideoPlayerTitleBar } from "./VideoPlayerTitleBar"
import { VideoPlayerContent } from "./VideoPlayerContent"

const store = createXRStore({
  foveation: 0,
  layers: true,
  domOverlay: false,
  // emulate: { inject: true },
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

// Video library
const videos: VideoOption[] = [
  { url: import.meta.env.BASE_URL + 'videos/bbb_sunflower_1080p_30fps_normal_10s.mp4', title: 'Normal' },
  { url: import.meta.env.BASE_URL + 'videos/bbb_sunflower_1080p_30fps_stereo_abl_10s.mp4', title: 'Stereo' }
]

export function App() {
  const [viewMode, setViewMode] = useState<'selection' | 'playing'>('selection')
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)

  console.log("App")

  const handleVideoSelect = (url: string, title: string) => {
    console.log('[App] Video selected:', title, url)
    setSelectedVideo({ url, title })
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
      <SplashScreen store={store} modes={['immersive-vr']}>
        <h1>QuadVideoPlayer Demo</h1>
        <p>
          This demo showcases the <code>QuadVideoPlayer</code> component from{" "}
          <a href="https://github.com/myers/r3f-xr-widgets">r3f-xr-widgets</a>.
          A complete VR video player with XR controller support, built with{" "}
          <a href="https://github.com/pmndrs/react-three-fiber">React Three Fiber</a>,{" "}
          <a href="https://github.com/pmndrs/xr">React XR</a>, and{" "}
          <a href="https://github.com/pmndrs/uikit">UIKit</a>.
        </p>

        <h2>Component Features</h2>
        <ul>
          <li><strong>XR Controller Support:</strong> Full controller integration with XR button mapping</li>
          <li><strong>Action Indicator:</strong> Visual feedback for play/pause/seek/buffering actions</li>
          <li><strong>Control Panel:</strong> Full playback controls with auto-hide behavior</li>
          <li><strong>Multiple Renderers:</strong> videoxr (auto-size), xrlayer (fixed), or uikit</li>
        </ul>

        <h2>XR Controller Mapping</h2>
        <ul>
          <li><strong>A button:</strong> Play/pause the video</li>
          <li><strong>B button:</strong> Toggle control panel visibility</li>
          <li><strong>Right thumbstick right:</strong> Seek forward 10 seconds</li>
          <li><strong>Right thumbstick left:</strong> Seek backward 10 seconds</li>
        </ul>
        <p><em>Note: Controller must be pointing at the video for buttons to work.</em></p>

        <h2>Testing</h2>
        <p>Tested on the Quest Browser.</p>
        <p>
          If your browser doesn't support VR, press{" "}
          <code>Window/Command + Alt/Option + E</code> to enable the iwer/devui Emulator.
        </p>

        <GitHubBadge repoUrl="https://github.com/myers/r3f-xr-widgets" />
      </SplashScreen>
      <Canvas
        events={noEvents}
        style={{ width: "100%", flexGrow: 1 }}
        camera={{ position: [0, DEFAULT_EYE_LEVEL, 0], fov: 50 }}
      >
        <PointerEvents />
        <XR store={store}>
          <IfInSessionMode allow="immersive-vr">
            <GridFloor />
          </IfInSessionMode>
          {/* Lighting setup */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 3, -5]} intensity={0.3} />
          <EyeLevelGroup defaultEyeLevel={DEFAULT_EYE_LEVEL}>
            <group position-z={-2.5}>
              <HorizonWindow
                width={2400}
                height={1800}
                minWidth={1800}
                maxWidth={3600}
                minHeight={1200}
                maxHeight={2400}
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
                  <Container
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    flexGrow={1}
                    width="100%"
                  >
                    {selectedVideo && <VideoPlayerContent videoUrl={selectedVideo.url} title={selectedVideo.title} />}
                  </Container>
                )}
              </HorizonWindow>
            </group>
          </EyeLevelGroup>
        </XR>
      </Canvas>
    </>
  )
}
