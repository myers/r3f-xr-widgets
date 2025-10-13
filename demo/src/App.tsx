import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { XR, createXRStore, PointerEvents, noEvents } from '@react-three/xr'
import { ResizableWindow, AudioEffects } from 'r3f-xr-widgets'
import { useState } from 'react'
import { Root, Container, Text } from '@react-three/uikit'

const store = createXRStore({ emulate: { syntheticEnvironment: false } })

// Default eye level for camera (in meters)
const DEFAULT_EYE_LEVEL = 1.5

function WindowDemo() {
  return (
    <ResizableWindow
      position={[0, 1.5, -1]}
      handleColor="#ff9999"
      autoRotateToCamera={false}
      initiallyRotateTowardsCamera={true}
      aspectRatio={16/9}
      baseScale={0.3}
    >
      <DemoContent aspectRatio={16/9} baseScale={0.3} />
    </ResizableWindow>
  )
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Environment preset="city" />

      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.5} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Audio Effects */}
      <AudioEffects />

      {/* Resizable Window */}
      <WindowDemo />
    </>
  )
}

function DemoContent({ aspectRatio = 16/9, baseScale = 0.3 }: { aspectRatio?: number, baseScale?: number }) {
  const [bgColor, setBgColor] = useState('#1a1a1a')
  
  // Calculate dimensions based on aspect ratio
  const contentWidth = 1000 * baseScale * aspectRatio
  const contentHeight = 1000 * baseScale
  
  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 2, 2]} />
      
      {/* UI Content using uikit */}
      <Root 
        pixelSize={0.001}
        anchorX="center"
        anchorY="center"
      >
        <Container
          width={contentWidth}
          height={contentHeight}
          backgroundColor={bgColor}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          padding={32}
          gap={24}
          borderRadius={16}
        >
          <Text
            fontSize={32}
            fontWeight="bold"
            color="white"
          >
            Hello World
          </Text>
          
          <Container
            backgroundColor="#ff6b6b"
            paddingX={24}
            paddingY={12}
            borderRadius={8}
            hover={{ backgroundColor: '#ff8888' }}
            cursor="pointer"
            onClick={() => {
              setBgColor(bgColor === '#1a1a1a' ? '#2d5a2d' : bgColor === '#2d5a2d' ? '#5a2d2d' : '#1a1a1a')
            }}
          >
            <Text fontSize={18} color="white">
              Change Background
            </Text>
          </Container>
        </Container>
      </Root>
    </group>
  )
}

function App() {
  return (
    <>
      <button 
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '0.5rem 1.5rem',
          fontSize: '1rem',
          background: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          zIndex: 1000,
        }}
        onClick={() => store.enterVR()}
      >
        Enter VR
      </button>
      
      <Canvas
        shadows
        camera={{ position: [0, DEFAULT_EYE_LEVEL, 0], fov: 50, rotation: [0, 0, 0] }}
        events={noEvents}
        style={{ background: '#000' }}
      >
        <PointerEvents />
        <XR store={store}>
          <Scene />
        </XR>
      </Canvas>
    </>
  )
}

export default App