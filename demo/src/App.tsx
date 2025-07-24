import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Box, Sphere, Cone, Environment } from '@react-three/drei'
import { XR, XROrigin, createXRStore, PointerEvents, noEvents } from '@react-three/xr'
import { useControls, folder } from 'leva'
import { ResizableWindow, AudioEffects } from 'r3f-xr-widgets'
import { useMemo, useState, useRef, useEffect } from 'react'
import { Root, Container, Text } from '@react-three/uikit'
import { Vector3 } from 'three'
import { OrbitHandles } from '@react-three/handle'

const store = createXRStore({ emulate: { syntheticEnvironment: false } })

function Scene() {
  const { 
    enableAudio,
    cameraDistance,
    ...windowProps 
  } = useControls({
    enableAudio: true,
    cameraDistance: { value: 1, min: 1, max: 10, step: 0.1 },
    
    'Window Properties': folder({
      position: { value: [0, 0, -0.8], step: 0.1 },
      handleColor: '#ff9999',
      autoRotateToCamera: false,
      initiallyRotateTowardsCamera: true,
      aspectRatio: { value: 16/9, min: 1, max: 2.5, step: 0.1 },
      baseScale: { value: 0.3, min: 0.1, max: 1, step: 0.05 },
    }),
  })

  // Camera distance controller  
  const CameraController = () => {
    const { camera } = useThree()
    
    useEffect(() => {
      // Set initial camera position based on distance
      const target = new Vector3(...windowProps.position)
      camera.position.set(target.x, target.y + 1, target.z + cameraDistance)
      camera.lookAt(target)
    }, [])
    
    useFrame(() => {
      // Update camera distance smoothly
      const target = new Vector3(...windowProps.position)
      const direction = new Vector3()
      direction.subVectors(camera.position, target).normalize()
      const newPosition = target.clone().add(direction.multiplyScalar(cameraDistance))
      camera.position.lerp(newPosition, 0.1)
    })
    
    return null
  }

  return (
    <>
      <CameraController />
      <OrbitHandles damping />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      
      {/* Ground */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.5} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Audio Effects */}
      {enableAudio && <AudioEffects />}

      {/* Resizable Window */}
      <ResizableWindow
        {...windowProps}
        minY={-0.3}
      >
        {/* Content inside the window */}
        <DemoContent />
      </ResizableWindow>
    </>
  )
}

function DemoContent() {
  const [bgColor, setBgColor] = useState('#1a1a1a')
  
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
          width={400}
          height={300}
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
        camera={{ position: [0, 1, 3], fov: 50 }}
        events={noEvents}
        style={{ background: '#000' }}
      >
        <XR store={store}>
          <PointerEvents />
          <XROrigin position={[0, 0, 0]} />
          <Scene />
        </XR>
      </Canvas>
    </>
  )
}

export default App