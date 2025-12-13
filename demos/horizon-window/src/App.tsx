import { Canvas } from '@react-three/fiber'
import { Container, Text, setPreferredColorScheme } from '@react-three/uikit'
import { createXRStore, IfInSessionMode, noEvents, PointerEvents, XR, XROrigin } from '@react-three/xr'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AudioEffects, DEFAULT_EYE_LEVEL, EyeLevelGroup, GridFloor, HorizonCursorMaterial, HorizonWindow, HorizonWindowTitleBar, Skybox, SplashScreen } from 'r3f-xr-widgets'

const store = createXRStore({
  foveation: 0,
  emulate: { syntheticEnvironment: true },
  // Configure cursor via default controller
  controller: {
    rayPointer: {
      cursorModel: {
        materialClass: HorizonCursorMaterial,
        size: 0.03,  // 3cm in world space
        renderOrder: 999
      }
    }
  }
})

setPreferredColorScheme('dark')

export default function App() {
  return (
    <>
      <SplashScreen store={store}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
          HorizonWindow Demo
        </h1>
        <p style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>
          Interactive resizable window with UIKit-based design
        </p>
        <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
          <li>Resizable corners with arc handles</li>
          <li>Movable via title bar or edge handles</li>
          <li>Proximity-based edge visibility</li>
          <li>UIKit-based flexible content</li>
        </ul>
      </SplashScreen>
      <Canvas
        events={noEvents}
        gl={{ localClippingEnabled: true }}
        style={{ width: '100%', flexGrow: 1 }}
        camera={{ position: [0, 0, 0.5] }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <PointerEvents batchEvents={false} />
        <XR store={store}>
          <IfInSessionMode allow="immersive-vr">
            <Skybox color="#404040" />
            <GridFloor />
          </IfInSessionMode>
          <AudioEffects />

          {/* Single HorizonWindow with interactive content */}
          <EyeLevelGroup defaultEyeLevel={DEFAULT_EYE_LEVEL}>
            <WindowSystem />
          </EyeLevelGroup>
        </XR>
      </Canvas>
    </>
  )
}

function WindowSystem() {
  const [width, setWidth] = useState(1000)
  const [height, setHeight] = useState(600)
  const [visible, setVisible] = useState(true)
  const [windowCount, setWindowCount] = useState(1)
  const timeoutRef = useRef<number | undefined>(undefined)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleClose = useCallback(() => {
    setWindowCount(prev => prev + 1)
    setVisible(false)
    timeoutRef.current = window.setTimeout(() => {
      setVisible(true)
    }, 1000)
  }, [])

  if (!visible) {
    return null // Window removed from scene
  }

  return (
    <group position-z={-1}>
      <HorizonWindow
        titleBar={<HorizonWindowTitleBar title="Hello World" onClose={handleClose} />}
        width={width}
        height={height}
        minWidth={300}
        maxWidth={2000}
        minHeight={250}
        maxHeight={1400}
        pixelSize={0.0015}
        onResize={(w, h) => {
          setWidth(w)
          setHeight(h)
        }}
      >
        <Container
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={20}
          flexGrow={1}
          backgroundColor="black"
        >
          <Text fontSize={48} color="rgb(243,244,246)">
            Hello World
          </Text>
          <Text fontSize={24} color="rgb(243,244,246)">
            Window #{windowCount}
          </Text>
          <Container
            flexDirection="row"
            gap={10}
            onClick={() => {
              console.log('[BUTTON CLICK] Before:', width, height)
              // Toggle between two sizes
              setWidth(width === 1000 ? 1400 : 1000)
              setHeight(height === 600 ? 900 : 600)
              console.log('[BUTTON CLICK] After:', width === 1000 ? 1400 : 1000, height === 600 ? 900 : 600)
            }}
            padding={10}
            backgroundColor={0x3b82f6}
            borderRadius={8}
            cursor="pointer"
          >
            <Text fontSize={24} color="white">
              Toggle Size
            </Text>
          </Container>
        </Container>
      </HorizonWindow>
    </group>
  )
}
