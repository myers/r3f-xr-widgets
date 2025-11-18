import { describe, it, expect, afterEach } from 'vitest'
import { render } from 'vitest-browser-react'
import { enterVRSession } from '../test-utils/vitest-helpers'
import { useMemo, useState } from 'react'
import { XRTestCanvas } from '../test-utils/xr-test-setup'
import { useVideoXRControls, type PlaybackAction } from './useVideoXRControls'
import { Container, Text } from '@react-three/uikit'

interface UseVideoXRControlsTestProps {
  requirePointerOnTarget?: boolean
}

// Mock video element - created once and reused
const createMockVideo = () => {
  // Remove any existing test video
  const existing = document.getElementById('test-video')
  if (existing) {
    existing.remove()
  }

  const videoElement = document.createElement('video')
  videoElement.id = 'test-video'
  videoElement.currentTime = 30
  Object.defineProperty(videoElement, 'duration', { value: 120, writable: true })

  // Use a getter/setter for paused to ensure it's always up to date
  let pausedState = true
  Object.defineProperty(videoElement, 'paused', {
    get: () => pausedState,
    set: (value: boolean) => { pausedState = value },
    configurable: true
  })

  // Mock play/pause methods
  videoElement.play = () => {
    pausedState = false
    videoElement.dispatchEvent(new Event('play'))
    return Promise.resolve()
  }
  videoElement.pause = () => {
    pausedState = true
    videoElement.dispatchEvent(new Event('pause'))
  }

  // Add to DOM so tests can find it
  document.body.appendChild(videoElement)

  return videoElement
}

function UseVideoXRControlsMesh({ video, requirePointerOnTarget }: { video: HTMLVideoElement; requirePointerOnTarget: boolean }) {
  const [lastAction, setLastAction] = useState<PlaybackAction | null>(null)

  const handleAction = (action: PlaybackAction) => {
    setLastAction(action)

    // Update DOM tracker
    const tracker = document.getElementById('video-controls-tracker')
    if (tracker) {
      const actionType = action.type.replace('-', '')
      const current = tracker.dataset[actionType] || '0'
      tracker.dataset[actionType] = String(parseInt(current) + 1)
      tracker.dataset.lastaction = action.type
      if (action.value !== undefined) {
        tracker.dataset.lastvalue = String(action.value)
      }
    }
  }

  const { targetRef, onPointerEnter, onPointerLeave, isPointerOnTarget } =
    useVideoXRControls({
      video,
      requirePointerOnTarget,
      onAction: handleAction
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
          useVideoXRControls Test
        </Text>

        <Text fontSize={20} color={isPointerOnTarget ? "#4ade80" : "#ef4444"}>
          Pointer: {isPointerOnTarget ? "ON" : "OFF"}
        </Text>


        <Container flexDirection="column" gap={8}>
          <Text fontSize={18} color="#94a3b8">
            Video State:
          </Text>
          <Text fontSize={16} color="#cbd5e1">
            Paused: {video.paused ? 'Yes' : 'No'}
          </Text>
          <Text fontSize={16} color="#cbd5e1">
            Time: {Math.floor(video.currentTime)}s / {Math.floor(video.duration)}s
          </Text>
        </Container>

        {lastAction && (
          <Container flexDirection="column" gap={4}>
            <Text fontSize={18} color="#94a3b8">
              Last Action:
            </Text>
            <Text fontSize={14} color="#cbd5e1">
              Type: {lastAction.type}
            </Text>
            {lastAction.value !== undefined && (
              <Text fontSize={14} color="#cbd5e1">
                Value: {lastAction.value}s
              </Text>
            )}
          </Container>
        )}

        <Text fontSize={14} color="#64748b">
          A: Play/Pause | B: Toggle Controls
        </Text>
        <Text fontSize={14} color="#64748b">
          Thumbstick: ← Rewind | Forward →
        </Text>
      </Container>
    </group>
  )
}

function UseVideoXRControlsTestScene({ requirePointerOnTarget = true }: UseVideoXRControlsTestProps) {
  // Create mock video element
  const video = useMemo(() => createMockVideo(), [])

  return (
    <>
      {/* Hidden tracker for test assertions */}
      <div
        id="video-controls-tracker"
        style={{ display: 'none' }}
        data-play="0"
        data-pause="0"
        data-seekforward="0"
        data-seekbackward="0"
        data-togglecontrols="0"
        data-lastaction=""
        data-lastvalue=""
      />

      <XRTestCanvas>
        <UseVideoXRControlsMesh video={video} requirePointerOnTarget={requirePointerOnTarget} />
      </XRTestCanvas>
    </>
  )
}

describe('useVideoXRControls Hook', () => {
  afterEach(async () => {
    // Clean up any existing session
    const canvas = document.querySelector('canvas')
    const store = (canvas as any)?.__xrStore
    if (store?.getState().session) {
      await store.getState().session.end()
    }

    // Clean up video element
    const video = document.getElementById('test-video')
    if (video) {
      video.remove()
    }

    // Clean up DOM
    document.body.innerHTML = ''
  })

  describe('Play/Pause Control (A Button)', () => {
    it('should play video when A button pressed and video is paused', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      const video = document.getElementById('test-video') as HTMLVideoElement
      expect(video).toBeDefined()
      expect(video!.paused).toBe(true)

      // Press A button to play
      await controllers.pressButton('a-button', 'right', 3)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.play, { timeout: 3000 }).toBe('1')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('play')
      expect(video!.paused).toBe(false)
    })

    it('should pause video when A button pressed and video is playing', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      const video = document.getElementById('test-video') as HTMLVideoElement

      // First press: play
      await controllers.pressButton('a-button', 'right', 3)
      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.play, { timeout: 3000 }).toBe('1')

      // Wait for video state to update and React to re-render
      await controllers.waitFrames(5)

      // Second press: pause
      await controllers.pressButton('a-button', 'right', 3)
      await expect.poll(() => tracker?.dataset.pause, { timeout: 3000 }).toBe('1')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('pause')
      expect(video!.paused).toBe(true)
    })
  })

  describe('Controls Visibility (B Button)', () => {
    it('should toggle controls visibility when B button pressed', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      // Press B button to toggle controls
      await controllers.pressButton('b-button', 'right', 3)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.togglecontrols, { timeout: 3000 }).toBe('1')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('toggle-controls')
    })

    it('should fire toggle-controls action when B pressed', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      await controllers.pressButton('b-button', 'right', 3)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.togglecontrols, { timeout: 3000 }).toBe('1')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('toggle-controls')
    })
  })

  describe('Seek Controls (Thumbstick)', () => {
    it('should seek forward 10 seconds on thumbstick right', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      const video = document.getElementById('test-video') as HTMLVideoElement
      const initialTime = video!.currentTime // Should be 30s

      // Move thumbstick right
      await controllers.moveThumbstick('right', 0.8, 0, 100)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.seekforward, { timeout: 3000 }).toBe('1')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('seek-forward')
      await expect.poll(() => tracker?.dataset.lastvalue, { timeout: 3000 }).toBe('10')

      // Video should have seeked forward 10 seconds
      expect(video!.currentTime).toBe(initialTime + 10)
    })

    it('should seek backward 10 seconds on thumbstick left', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      const video = document.getElementById('test-video') as HTMLVideoElement
      const initialTime = video!.currentTime // Should be 30s

      // Move thumbstick left
      await controllers.moveThumbstick('right', -0.8, 0, 100)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.seekbackward, { timeout: 3000 }).toBe('1')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('seek-backward')
      await expect.poll(() => tracker?.dataset.lastvalue, { timeout: 3000 }).toBe('10')

      // Video should have seeked backward 10 seconds
      expect(video!.currentTime).toBe(initialTime - 10)
    })

    it('should clamp forward seek at video duration', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      const video = document.getElementById('test-video') as HTMLVideoElement
      // Set time near end (duration is 120s)
      video!.currentTime = 115

      // Try to seek forward 10 seconds (would go to 125, but should clamp to 120)
      await controllers.moveThumbstick('right', 0.8, 0, 100)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.seekforward, { timeout: 3000 }).toBe('1')

      // Should be clamped to duration
      expect(video!.currentTime).toBe(120)
    })

    it('should clamp backward seek at 0', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      const video = document.getElementById('test-video') as HTMLVideoElement
      // Set time near beginning
      video!.currentTime = 5

      // Try to seek backward 10 seconds (would go to -5, but should clamp to 0)
      await controllers.moveThumbstick('right', -0.8, 0, 100)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.seekbackward, { timeout: 3000 }).toBe('1')

      // Should be clamped to 0
      expect(video!.currentTime).toBe(0)
    })
  })

  describe('Pointer Awareness', () => {
    it('should not fire actions when pointer is off target (requirePointerOnTarget=true)', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={true} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      // Move controller away from target
      const emulator = controllers['store'].getState().emulator
      const controller = emulator?.controllers.right
      if (controller) {
        controller.position.set(2, 1.5, -2)
        controller.quaternion.y = 0.707  // Point away
        controller.quaternion.w = 0.707
      }
      await controllers.waitFrames(2)

      // Press A button while NOT pointing
      await controllers.pressButton('a-button', 'right', 3)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Verify button was NOT pressed
      const tracker = document.getElementById('video-controls-tracker')
      expect(tracker!.dataset.play).toBe('0')
      expect(tracker!.dataset.pause).toBe('0')
    })

    it('should fire actions regardless of pointer when requirePointerOnTarget=false', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      // Move controller away from target (same as above)
      const emulator = controllers['store'].getState().emulator
      const controller = emulator?.controllers.right
      if (controller) {
        controller.position.set(2, 1.5, -2)
        controller.quaternion.y = 0.707
        controller.quaternion.w = 0.707
      }
      await controllers.waitFrames(2)

      // Press A button while NOT pointing
      await controllers.pressButton('a-button', 'right', 3)

      // Button SHOULD fire even without pointer on target
      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.play, { timeout: 3000 }).toBe('1')
    })
  })

  describe('Action Callbacks', () => {
    it('should fire onAction callback with correct PlaybackAction for play', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      await controllers.pressButton('a-button', 'right', 3)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('play')
    })

    it('should fire onAction callback with correct PlaybackAction for seek', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      await controllers.moveThumbstick('right', 0.8, 0, 100)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('seek-forward')
      await expect.poll(() => tracker?.dataset.lastvalue, { timeout: 3000 }).toBe('10')
    })

    it('should fire onAction callback with correct PlaybackAction for controls toggle', async () => {
      render(<UseVideoXRControlsTestScene requirePointerOnTarget={false} />)

      const { controllers } = await enterVRSession({
        container: document.body,
        timeout: 10000
      })

      await controllers.pressButton('b-button', 'right', 3)

      const tracker = document.getElementById('video-controls-tracker')
      await expect.poll(() => tracker?.dataset.lastaction, { timeout: 3000 }).toBe('toggle-controls')
    })
  })
})
