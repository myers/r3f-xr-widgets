import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render } from 'vitest-browser-react'
import { enterVRSession, createTestXRStore } from '../test-utils/vitest-helpers'
import { useState } from 'react'
import type { XRStore } from '@react-three/xr'
import { XRTestCanvas } from '../test-utils/xr-test-setup'
import { useXRButtons } from './useXRButtons'
import { Container, Text } from '@react-three/uikit'

interface UseXRButtonsTestProps {
  store: XRStore
  onButtonPress?: (button: string) => void
  requirePointerOn?: boolean
  /** Position of target. Default [5, 1.5, -3] is away from controller. [0, 1.5, -3] is hit by default controller ray. */
  targetPosition?: [number, number, number]
}

function UseXRButtonsTestMesh({ onButtonPress, requirePointerOn = true, targetPosition = [5, 1.5, -3] }: Omit<UseXRButtonsTestProps, 'store'>) {
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
    <group position={targetPosition} ref={targetRef} name="xr-buttons-test-target">
      <Container
        pixelSize={0.010}
        flexDirection="column"
        alignItems="center"
        gap={20}
        padding={32}
        backgroundColor="#1a1a1a"
        borderRadius={16}
        onPointerEnter={() => {
          onPointerEnter()
          if (targetRef.current) targetRef.current.userData.pointerOn = true
        }}
        onPointerLeave={() => {
          onPointerLeave()
          if (targetRef.current) targetRef.current.userData.pointerOn = false
        }}
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

function UseXRButtonsTestScene({ store, ...props }: UseXRButtonsTestProps) {
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

      <XRTestCanvas store={store}>
        <UseXRButtonsTestMesh {...props} />
      </XRTestCanvas>
    </>
  )
}

describe('useXRButtons Hook', () => {
  let store: XRStore

  beforeEach(async () => {
    // Clean up DOM
    document.body.innerHTML = ''
    // Create store and wait for iwer (outside React to avoid act() warnings)
    store = await createTestXRStore()
  })

  afterEach(async () => {
    // Clean up any existing session
    const canvas = document.querySelector('canvas')
    const canvasStore = (canvas as any)?.__xrStore
    if (canvasStore?.getState().session) {
      await canvasStore.getState().session.end()
    }
    // Clean up DOM
    document.body.innerHTML = ''
  })

  describe('Button Presses', () => {
    it('should detect A button press (right controller)', async () => {
      // Render component
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

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
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

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
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

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
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

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
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

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
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

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
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

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
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

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
      // Render with target at default position (away from controller)
      render(<UseXRButtonsTestScene store={store} requirePointerOn={true} />)

      const tracker = document.getElementById('button-tracker')
      expect(tracker).toBeDefined()

      const { controllers, scene } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Enable hideUI to disable DevUI's syncDeviceTransforms()
      // Note: The property is 'devui' (lowercase), not 'devUI' (camelCase)
      const emulator = controllers['store'].getState().emulator
      if (emulator?.devui) {
        emulator.devui.hideUI = true
        expect(emulator.devui.hideUI, '@iwer/devui patch not applied - run pnpm install --force').toBe(true)
      }

      // Find target by name - it's at (5, 1.5, -3), default controller ray does NOT hit it
      const target = scene.getObjectByName('xr-buttons-test-target')
      expect(target, 'Target not found in scene').toBeDefined()

      // Verify pointer is initially OFF target
      expect(target?.userData.pointerOn, 'Pointer should initially be off target').not.toBe(true)

      // Point at target dynamically
      await controllers.point({ name: 'xr-buttons-test-target' })

      // Poll until pointer is confirmed ON target
      await expect.poll(() => target?.userData.pointerOn, { timeout: 3000 }).toBe(true)

      // Press A button - should work because pointer is on target
      await controllers.pressButton('a-button', 'right', 3)

      // Verify A button WAS pressed with pointer on target
      await expect.poll(() => tracker?.dataset.a, { timeout: 3000 }).toBe('1')
    })

    it('should not fire when pointer is not on target (requirePointerOn=true)', async () => {
      // This test validates that the hook DOES respect requirePointerOn
      render(<UseXRButtonsTestScene store={store} requirePointerOn={true} />)

      const tracker = document.getElementById('button-tracker')
      expect(tracker).toBeDefined()

      const { controllers, scene } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Enable hideUI to disable DevUI's syncDeviceTransforms()
      // Note: The property is 'devui' (lowercase), not 'devUI' (camelCase)
      const emulator = controllers['store'].getState().emulator
      if (emulator?.devui) {
        emulator.devui.hideUI = true
        expect(emulator.devui.hideUI, '@iwer/devui patch not applied - run pnpm install').toBe(true)
      }

      // Find target by name - it's at x=5, far from default controller ray
      const target = scene.getObjectByName('xr-buttons-test-target')
      expect(target, 'Target not found in scene').toBeDefined()

      // Pointer should NOT be on target (target at x=5, controller ray along -Z)
      expect(target?.userData.pointerOn, 'Pointer should not be on target').not.toBe(true)

      // Press A button while NOT pointing at target
      await controllers.pressButton('a-button', 'right', 3)

      // Verify button was NOT pressed (because pointer not on target)
      expect(tracker!.dataset.a, 'Button should NOT fire when pointer is off target').toBe('0')
    })

    it('should fire regardless of pointer when requirePointerOn is false', async () => {
      // Render component without pointer requirement
      render(<UseXRButtonsTestScene store={store} requirePointerOn={false} />)

      const tracker = document.getElementById('button-tracker')
      expect(tracker).toBeDefined()

      const { controllers, scene } = await enterVRSession({ container: document.body, timeout: 10000 })

      // Find target - it's at x=5, so pointer is NOT on target by default
      const target = scene.getObjectByName('xr-buttons-test-target')
      expect(target, 'Target not found in scene').toBeDefined()

      // Pointer is NOT on target (target at x=5, controller ray along -Z)
      expect(target?.userData.pointerOn, 'Pointer should not be on target').not.toBe(true)

      // Press A button while NOT pointing at target
      await controllers.pressButton('a-button', 'right', 3)

      // Verify A button WAS pressed (even without pointer on target, because requirePointerOn=false)
      await expect.poll(() => tracker?.dataset.a, { timeout: 3000 }).toBe('1')
    })
  })
})
