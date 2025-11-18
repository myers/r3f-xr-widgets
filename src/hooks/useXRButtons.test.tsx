import { describe, it, expect, afterEach } from 'vitest'
import { render } from 'vitest-browser-react'
import { enterVRSession } from '../test-utils/vitest-helpers'
import { useState } from 'react'
import { XRTestCanvas } from '../test-utils/xr-test-setup'
import { useXRButtons } from './useXRButtons'
import { Container, Text } from '@react-three/uikit'

interface UseXRButtonsTestProps {
  onButtonPress?: (button: string) => void
  requirePointerOn?: boolean
}

function UseXRButtonsTestMesh({ onButtonPress, requirePointerOn = true }: UseXRButtonsTestProps) {
  const [pressedButtons, setPressedButtons] = useState<string[]>([])

  const handleButtonPress = (buttonName: string) => {
    setPressedButtons(prev => [...prev, buttonName])
    onButtonPress?.(buttonName)

    // Update DOM for test assertions
    const tracker = document.getElementById('button-tracker')
    if (tracker) {
      const current = tracker.dataset[buttonName] || '0'
      const newValue = parseInt(current) + 1
      tracker.dataset[buttonName] = String(newValue)
    }
  }

  const { targetRef, onPointerEnter, onPointerLeave, isPointerOnTarget } = useXRButtons({
    onAPress: () => handleButtonPress('a'),
    onBPress: () => handleButtonPress('b'),
    onXPress: () => handleButtonPress('x'),
    onYPress: () => handleButtonPress('y'),
    onThumbstickUp: () => handleButtonPress('thumbstickup'),
    onThumbstickDown: () => handleButtonPress('thumbstickdown'),
    onThumbstickLeft: () => handleButtonPress('thumbstickleft'),
    onThumbstickRight: () => handleButtonPress('thumbstickright'),
    requirePointerOn
  })

  return (
    <group position={[0, 1.5, -3]} ref={targetRef}>
      <Container
        pixelSize={0.010}
        flexDirection="column"
        alignItems="center"
        gap={20}
        padding={32}
        backgroundColor="#1a1a1a"
        borderRadius={16}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <Text fontSize={32} fontWeight="bold" color="white">
          useXRButtons Test
        </Text>

        <Text fontSize={20} color={isPointerOnTarget ? "#4ade80" : "#ef4444"}>
          Pointer: {isPointerOnTarget ? "ON" : "OFF"}
        </Text>

        <Container flexDirection="column" gap={8}>
          <Text fontSize={18} color="#94a3b8">
            Pressed Buttons: {pressedButtons.length}
          </Text>
          {pressedButtons.slice(-5).map((btn, idx) => (
            <Text key={idx} fontSize={16} color="#cbd5e1">
              {idx + 1}. {btn}
            </Text>
          ))}
        </Container>
      </Container>
    </group>
  )
}

function UseXRButtonsTestScene(props: UseXRButtonsTestProps) {
  return (
    <>
      {/* Hidden tracker for test assertions */}
      <div
        id="button-tracker"
        style={{ display: 'none' }}
        data-a="0"
        data-b="0"
        data-x="0"
        data-y="0"
        data-thumbstickup="0"
        data-thumbstickdown="0"
        data-thumbstickleft="0"
        data-thumbstickright="0"
      />

      <XRTestCanvas>
        <UseXRButtonsTestMesh {...props} />
      </XRTestCanvas>
    </>
  )
}

describe('useXRButtons Hook', () => {
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

  describe('Button Presses', () => {
    it('should detect A button press (right controller)', async () => {
      // Render component
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      // Enter VR session and get controllers
      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Press A button
      await controllers.pressButton('a-button', 'right', 3)

      // Assert event fired
      const tracker = document.getElementById('button-tracker')
      await expect.poll(() => tracker?.dataset.a, { timeout: 3000 }).toBe('1')
    })

    it('should detect B button press (right controller)', async () => {
      // Render component
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      // Enter VR session and get controllers
      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Press B button
      await controllers.pressButton('b-button', 'right', 3)

      // Assert event fired
      const tracker = document.getElementById('button-tracker')
      await expect.poll(() => tracker?.dataset.b, { timeout: 3000 }).toBe('1')
    })

    it('should detect X button press (left controller)', async () => {
      // Render component
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      // Enter VR session and get controllers
      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Press X button
      await controllers.pressButton('x-button', 'left', 3)

      // Assert event fired
      const tracker = document.getElementById('button-tracker')
      await expect.poll(() => tracker?.dataset.x, { timeout: 3000 }).toBe('1')
    })

    it('should detect Y button press (left controller)', async () => {
      // Render component
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      // Enter VR session and get controllers
      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Press Y button
      await controllers.pressButton('y-button', 'left', 3)

      // Assert event fired
      const tracker = document.getElementById('button-tracker')
      await expect.poll(() => tracker?.dataset.y, { timeout: 3000 }).toBe('1')
    })
  })

  describe('Thumbstick Movement', () => {
    it('should detect thumbstick up', async () => {
      // Render component
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      // Enter VR session and get controllers
      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Move thumbstick up (Y axis negative)
      await controllers.moveThumbstick('right', 0, -0.8, 100)

      // Assert event fired
      const tracker = document.getElementById('button-tracker')
      await expect.poll(() => tracker?.dataset.thumbstickup, { timeout: 3000 }).toBe('1')
    })

    it('should detect thumbstick down', async () => {
      // Render component
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      // Enter VR session and get controllers
      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Move thumbstick down (Y axis positive)
      await controllers.moveThumbstick('right', 0, 0.8, 100)

      // Assert event fired
      const tracker = document.getElementById('button-tracker')
      await expect.poll(() => tracker?.dataset.thumbstickdown, { timeout: 3000 }).toBe('1')
    })

    it('should detect thumbstick left', async () => {
      // Render component
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      // Enter VR session and get controllers
      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Move thumbstick left (X axis negative)
      await controllers.moveThumbstick('right', -0.8, 0, 100)

      // Assert event fired
      const tracker = document.getElementById('button-tracker')
      await expect.poll(() => tracker?.dataset.thumbstickleft, { timeout: 3000 }).toBe('1')
    })

    it('should detect thumbstick right', async () => {
      // Render component
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      // Enter VR session and get controllers
      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Move thumbstick right (X axis positive)
      await controllers.moveThumbstick('right', 0.8, 0, 100)

      // Assert event fired
      const tracker = document.getElementById('button-tracker')
      await expect.poll(() => tracker?.dataset.thumbstickright, { timeout: 3000 }).toBe('1')
    })
  })

  describe('Pointer Awareness', () => {
    it('should require pointer when requirePointerOn is true', async () => {
      // Render component with pointer requirement
      render(<UseXRButtonsTestScene requirePointerOn={true} />)

      const tracker = document.getElementById('button-tracker')
      expect(tracker).toBeDefined()

      const { controllers, scene } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Point controller straight down so it's NOT pointing at target (away from target at (0, 1.5, -3))
      const emulator = controllers['store'].getState().emulator
      const controller = emulator?.controllers.right
      if (controller) {
        // Point straight down (90 degrees around X axis) - quaternion for X-axis rotation
        // Quaternion for 90° rotation around X: (sin(45°), 0, 0, cos(45°)) = (0.707, 0, 0, 0.707)
        controller.quaternion.x = 0.707
        controller.quaternion.y = 0
        controller.quaternion.z = 0
        controller.quaternion.w = 0.707
      }
      await controllers.waitFrames(2)

      // Press A button WITHOUT pointing at target
      await controllers.pressButton('a-button', 'right', 3)

      // Wait a bit to ensure no trigger
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify A button was NOT pressed (because pointer not on target)
      expect(tracker!.dataset.a, 'A button should NOT be pressed without pointer').toBe('0')

      // Now point at target - find the group (positioned at [0, 1.5, -3])
      const targetGroup = scene.children.find(child =>
        child.type === 'Group' && child.position.y === 1.5
      )
      if (!targetGroup) {
        throw new Error('Target group not found in scene')
      }

      await controllers.point(targetGroup)
      await controllers.pressButton('a-button', 'right', 3)

      // Verify A button WAS pressed with pointer on target
      await expect.poll(() => tracker?.dataset.a, { timeout: 3000 }).toBe('1')
    })

    it('should not fire when pointer is not on target (requirePointerOn=true)', async () => {
      // This test validates that the hook DOES respect requirePointerOn
      render(<UseXRButtonsTestScene requirePointerOn={true} />)

      const tracker = document.getElementById('button-tracker')
      expect(tracker).toBeDefined()

      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Move controller to the side so it's NOT pointing at target
      const emulator = controllers['store'].getState().emulator
      const controller = emulator?.controllers.right
      if (controller) {
        controller.position.set(2, 1.5, -2)
        // Point right (away from target at (0, 1.5, -3))
        controller.quaternion.y = 0.707
        controller.quaternion.w = 0.707
      }
      await controllers.waitFrames(2)

      // Press A button while NOT pointing at target
      await controllers.pressButton('a-button', 'right', 3)

      // Wait to ensure no trigger
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify button was NOT pressed (because pointer not on target)
      expect(tracker!.dataset.a, 'Button should NOT fire when pointer is off target').toBe('0')
    })

    it('should fire regardless of pointer when requirePointerOn is false', async () => {
      // Render component without pointer requirement
      render(<UseXRButtonsTestScene requirePointerOn={false} />)

      const tracker = document.getElementById('button-tracker')
      expect(tracker).toBeDefined()

      const { controllers } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Move controller away from target (same position as above test)
      const emulator = controllers['store'].getState().emulator
      const controller = emulator?.controllers.right
      if (controller) {
        controller.position.set(2, 1.5, -2)
        controller.quaternion.y = 0.707
        controller.quaternion.w = 0.707
      }
      await controllers.waitFrames(2)

      // Press A button while NOT pointing at target
      await controllers.pressButton('a-button', 'right', 3)

      // Verify A button WAS pressed (even without pointer on target)
      await expect.poll(() => tracker?.dataset.a, { timeout: 3000 }).toBe('1')
    })
  })
})
