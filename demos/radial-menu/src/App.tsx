import { Canvas } from '@react-three/fiber'
import { Environment, Text, Sphere } from '@react-three/drei'
import { XR, createXRStore, PointerEvents, noEvents, useXR } from '@react-three/xr'
import { RadialMenu, RadialMenuSection, AudioEffects, SplashScreen, GitHubBadge } from '../../../src/index'
import { useState } from 'react'

const store = createXRStore() // Use default config like working examples

// Default eye level for camera (in meters)
const DEFAULT_EYE_LEVEL = 1.5

// Define menu sections for different demos
const fourSectionMenu: RadialMenuSection[] = [
  { id: 'option1', label: 'Option 1', data: { color: '#ff6b6b', option: 'Option 1' } },
  { id: 'option2', label: 'Option 2', data: { color: '#51cf66', option: 'Option 2' } },
  { id: 'option3', label: 'Option 3', data: { color: '#339af0', option: 'Option 3' } },
  { id: 'option4', label: 'Option 4', data: { color: '#ffd43b', option: 'Option 4' } },
]

const sixSectionMenu: RadialMenuSection[] = [
  { id: 'action1', label: 'Jump', data: { icon: '⬆️', action: 'jump' } },
  { id: 'action2', label: 'Run', data: { icon: '🏃', action: 'run' } },
  { id: 'action3', label: 'Crouch', data: { icon: '⬇️', action: 'crouch' } },
  { id: 'action4', label: 'Attack', data: { icon: '⚔️', action: 'attack' } },
  { id: 'action5', label: 'Defend', data: { icon: '🛡️', action: 'defend' } },
  { id: 'action6', label: 'Heal', data: { icon: '❤️', action: 'heal' } },
]

const eightSectionMenu: RadialMenuSection[] = [
  { id: 'red', data: { color: '#ff0000' } },
  { id: 'orange', data: { color: '#ff7f00' } },
  { id: 'yellow', data: { color: '#ffff00' } },
  { id: 'green', data: { color: '#00ff00' } },
  { id: 'cyan', data: { color: '#00ffff' } },
  { id: 'blue', data: { color: '#0000ff' } },
  { id: 'purple', data: { color: '#8b00ff' } },
  { id: 'magenta', data: { color: '#ff00ff' } },
]

function Scene() {
  const [selectedAction, setSelectedAction] = useState<string>('None')
  const [selectedColor, setSelectedColor] = useState<string>('#888888')
  const [selectedOption, setSelectedOption] = useState<string>('None')
  const session = useXR((state) => state.session)
  const isAR = session?.mode === 'immersive-ar'

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Environment preset="city" />

      {/* Audio Effects */}
      <AudioEffects />

      {/* Display selected values in 3D space */}
      <group position={[0, 1.6, -1.5]}>
        <Text
          position={[0, 0.15, 0]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          4-Section Menu (Grip Button - Right Hand)
        </Text>
        <Text
          position={[0, 0.05, 0]}
          fontSize={0.06}
          color="#51cf66"
          anchorX="center"
          anchorY="middle"
        >
          Selected: {selectedOption}
        </Text>
      </group>

      {/* Radial Menu: 4 sections - Right hand grip button */}
      <RadialMenu
        hand="right"
        triggerButton="xr-standard-squeeze"
        sections={fourSectionMenu}
        radius={0.12}
        onSelect={(section) => {
          if (section) {
            setSelectedOption(section.data.option)
            console.log('[Demo] Selected option:', section.data.option)
          } else {
            console.log('[Demo] No selection made')
          }
        }}
      >
        {(section, index, highlighted) => {
          const anglePerSection = (Math.PI * 2) / 4
          const startAngle = index * anglePerSection - Math.PI / 2
          const midAngle = startAngle + anglePerSection / 2
          const radius = 0.12
          const x = Math.cos(midAngle) * radius
          const y = Math.sin(midAngle) * radius
          const scale = highlighted ? 1.4 : 1.0

          return (
            <group position={[x, y, 0]}>
              <Sphere args={[0.025]} scale={scale}>
                <meshStandardMaterial color={section.data.color} emissive={section.data.color} emissiveIntensity={highlighted ? 0.5 : 0} />
              </Sphere>
              {section.label && (
                <Text
                  position={[0, -0.05, 0.01]}
                  fontSize={0.025}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                  scale={scale}
                >
                  {section.label}
                </Text>
              )}
            </group>
          )
        }}
      </RadialMenu>

      {/* OTHER MENUS COMMENTED OUT FOR TESTING
      <RadialMenu
        hand="left"
        triggerButton="a-button"
        sections={sixSectionMenu}
        ...
      />

      <RadialMenu
        hand="right"
        triggerButton="a-button"
        sections={eightSectionMenu}
        ...
      />
      */}

      {/* Ground reference - REMOVED FOR TESTING */}
    </>
  )
}

function App() {
  return (
    <>
      <SplashScreen store={store}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
          Radial Menu Demo (Testing)
        </h1>
        <p style={{ margin: '0 0 1rem 0', lineHeight: '1.6' }}>
          This demo showcases the <strong>RadialMenu</strong> component - an XR radial menu system
          for React Three Fiber applications with controller thumbstick navigation.
        </p>
        <ul style={{ margin: '0 0 1rem 0', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
          <li><strong>Press &amp; Hold</strong> grip button (right hand) to show menu</li>
          <li><strong>Move thumbstick</strong> to highlight options</li>
          <li><strong>Release button</strong> to select</li>
          <li><strong>Haptic feedback</strong> when changing options</li>
        </ul>
        <GitHubBadge repoUrl="https://github.com/myers/r3f-xr-widgets" />
      </SplashScreen>

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
