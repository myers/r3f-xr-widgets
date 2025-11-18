import { describe, it, expect, afterEach } from 'vitest'
import { render } from 'vitest-browser-react'
import { enterVRSession } from '../test-utils/vitest-helpers'
import { findObjectInScene } from '../test-utils'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useXRInputSourceState } from '@react-three/xr'
import { XRTestCanvas } from '../test-utils/xr-test-setup'
import { Container, Text } from '@react-three/uikit'
import { Button } from '@react-three/uikit-horizon'

interface XRButtonTestMeshProps {
  onEventFired?: () => void
  skipPointerCheck?: boolean  // For testing: check button state even without pointer-on
}

function XRButtonTestMesh({ onEventFired, skipPointerCheck = false }: XRButtonTestMeshProps) {
  const containerRef = useRef<any>(null)
  const [isPointerOn, setIsPointerOn] = useState(false)
  const [buttonADown, setButtonADown] = useState(false)
  const [clickedButtons, setClickedButtons] = useState<Set<number>>(new Set())
  const controller = useXRInputSourceState('controller', 'right')

  // Track 'apressed' events - write to data attribute
  useEffect(() => {
    if (!containerRef.current) return

    const handleAPressed = () => {
      // Update data attribute on event tracker div
      const tracker = document.getElementById('xr-event-tracker')
      if (tracker) {
        const current = parseInt(tracker.dataset.apressed || '0')
        tracker.dataset.apressed = String(current + 1)
      }
    }

    containerRef.current.addEventListener('apressed', handleAPressed)
    return () => {
      containerRef.current?.removeEventListener('apressed', handleAPressed)
    }
  }, [])

  // Track pointer on panel
  const handlePointerEnter = () => {
    setIsPointerOn(true)
  }

  const handlePointerLeave = () => {
    setIsPointerOn(false)
  }

  // Poll for A button press when pointing at panel
  useFrame(() => {
    if (!controller) {
      return
    }

    if (!skipPointerCheck && !isPointerOn) {
      return
    }

    // Check A button - use controller.gamepad directly (not inputSource.gamepad)
    if (controller?.gamepad?.['a-button']?.state === 'pressed' && !buttonADown) {
      setButtonADown(true)

      // Dispatch event on container
      if (containerRef.current) {
        containerRef.current.dispatchEvent({ type: 'apressed' })
      }

      onEventFired?.()
    }

    if (controller?.gamepad?.['a-button']?.state !== 'pressed' && buttonADown) {
      setButtonADown(false)
    }
  })

  const handleButtonClick = (buttonNum: number) => {
    // Add to clicked buttons set
    setClickedButtons(prev => new Set(prev).add(buttonNum))

    // Update data attribute on event tracker div
    const tracker = document.getElementById('xr-event-tracker')
    if (tracker) {
      tracker.dataset[`button${buttonNum}`] = 'clicked'
    }
  }

  return (
    <group position={[0, 1.5, -3]}>
      <Container
        ref={containerRef}
        pixelSize={0.010}
        flexDirection="column"
        alignItems="center"
        gap={20}
        padding={32}
        backgroundColor="#1a1a1a"
        borderRadius={16}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <Text fontSize={32} fontWeight="bold" color="white">
          Test Button Selection
        </Text>

        <Container flexDirection="column" gap={10}>
          {[0, 1, 2].map((row) => (
            <Container key={row} flexDirection="row" gap={10}>
              {[1, 2, 3].map((col) => {
                const buttonNum = row * 3 + col
                const isClicked = clickedButtons.has(buttonNum)
                return (
                  <Button
                    key={buttonNum}
                    name={`button-${buttonNum}`}
                    variant="primary"
                    backgroundColor={isClicked ? '#9333ea' : undefined}
                    onClick={() => handleButtonClick(buttonNum)}
                    onPointerEnter={() => {
                      // Button hover
                    }}
                  >
                    <Text>Button {buttonNum}</Text>
                  </Button>
                )
              })}
            </Container>
          ))}
        </Container>
      </Container>
    </group>
  )
}

function XRButtonTestScene({ onEventFired, skipPointerCheck }: XRButtonTestMeshProps) {
  return (
    <>
      {/* Hidden event tracker for test assertions */}
      <div
        id="xr-event-tracker"
        style={{ display: 'none' }}
        data-apressed="0"
      />

      <XRTestCanvas>
        <XRButtonTestMesh onEventFired={onEventFired} skipPointerCheck={skipPointerCheck} />
      </XRTestCanvas>
    </>
  )
}

describe('XR Button Test', () => {
  afterEach(async () => {
    // Clean up any existing session
    const canvas = document.querySelector('canvas')
    const store = (canvas as any)?.__xrStore
    if (store?.getState().session) {
      await store.getState().session.end()
    }
    // Clean up DOM
    document.body.innerHTML = ''
  })

  it('should press A button and trigger event', async () => {
    // Render component
    render(<XRButtonTestScene skipPointerCheck={true} />)

    // Enter VR session and get controllers (use document.body as container)
    const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

    // Press A button
    await controllers.pressButton('a-button', 'right', 1)

    // Assert event fired
    const tracker = document.getElementById('xr-event-tracker')
    await expect.poll(() => tracker?.dataset.apressed, { timeout: 3000 }).toBe('1')
  })

  it('should click UI buttons when controller points at them', async () => {
    // Render component with pointer detection enabled
    render(<XRButtonTestScene skipPointerCheck={false} />)

    // Enter VR session and get controllers + scene
    const { scene, controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

    // Wait for button-1 to be available in scene
    await expect.poll(() => findObjectInScene(scene, 'button-1'), { timeout: 5000 }).toBeDefined()

    const tracker = document.getElementById('xr-event-tracker')

    // Test clicking each of the 9 buttons
    for (let buttonNum = 1; buttonNum <= 9; buttonNum++) {
      // Point controller at button and click it
      await controllers.clickAt({ name: `button-${buttonNum}` })

      // Verify the button was clicked
      await expect.poll(() => tracker?.dataset[`button${buttonNum}`], { timeout: 3000 }).toBe('clicked')
    }
  })
})
