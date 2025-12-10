import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVideoXRControls } from './useVideoXRControls'
import { createMockVideo } from '../test-utils'
import type { UseXRButtonsReturn } from './useXRButtons'

// Mock the useXRButtons hook
vi.mock('./useXRButtons', () => ({
  useXRButtons: vi.fn()
}))

import { useXRButtons } from './useXRButtons'
const mockUseXRButtons = vi.mocked(useXRButtons)

describe('useVideoXRControls Hook', () => {
  let mockVideo: HTMLVideoElement
  let mockXRButtonsReturn: UseXRButtonsReturn
  let onActionCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Create fresh mock video
    mockVideo = createMockVideo({
      currentTime: 30,
      duration: 120,
      paused: true
    })

    // Create mock XR buttons return value
    mockXRButtonsReturn = {
      targetRef: { current: null },
      onPointerEnter: vi.fn(),
      onPointerLeave: vi.fn(),
      isPointerOnTarget: true
    }

    // Setup useXRButtons mock to return our mock and capture callbacks
    mockUseXRButtons.mockImplementation((options) => {
      // Store the callbacks so we can call them in tests
      ;(mockXRButtonsReturn as any).__callbacks = options
      return mockXRButtonsReturn
    })

    // Create action callback
    onActionCallback = vi.fn() as any
  })

  describe('Play/Pause Control (A Button)', () => {
    it('should play video when A button pressed and video is paused', () => {
      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false,
          onAction: onActionCallback as any
        })
      )

      expect(mockVideo.paused).toBe(true)

      // Simulate A button press (play/pause callback)
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onAPress()
      })

      expect(mockVideo.play).toHaveBeenCalled()
      expect(mockVideo.paused).toBe(false)
      expect(onActionCallback).toHaveBeenCalledWith({
        type: 'play',
        source: 'controller'
      })
    })

    it('should pause video when A button pressed and video is playing', () => {
      // Start with playing video
      mockVideo = createMockVideo({ paused: false })
      Object.defineProperty(mockVideo, 'paused', {
        get: () => false,
        configurable: true
      })

      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false,
          onAction: onActionCallback as any
        })
      )

      // Simulate A button press
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onAPress()
      })

      expect(mockVideo.pause).toHaveBeenCalled()
      expect(onActionCallback).toHaveBeenCalledWith({
        type: 'pause',
        source: 'controller'
      })
    })
  })

  describe('Controls Visibility (B Button)', () => {
    it('should fire toggle-controls action when B pressed', () => {
      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false,
          onAction: onActionCallback as any
        })
      )

      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onBPress()
      })

      expect(onActionCallback).toHaveBeenCalledWith({
        type: 'toggle-controls',
        source: 'controller'
      })
    })

    it('should call toggleControlsRef function when B button pressed', () => {
      const toggleFn = vi.fn()
      const { result } = renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false
        })
      )

      // Set up the toggle function
      result.current.toggleControlsRef.current = toggleFn

      // Simulate B button press
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onBPress()
      })

      expect(toggleFn).toHaveBeenCalled()
    })
  })

  describe('Seek Controls (Thumbstick)', () => {
    it('should seek forward 10 seconds on thumbstick right', () => {
      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false,
          onAction: onActionCallback as any
        })
      )

      const initialTime = mockVideo.currentTime // 30s

      // Simulate thumbstick right
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onThumbstickRight()
      })

      expect(mockVideo.currentTime).toBe(initialTime + 10)
      expect(mockVideo.currentTime).toBe(40)
      expect(onActionCallback).toHaveBeenCalledWith({
        type: 'seek-forward',
        source: 'controller',
        value: 10
      })
    })

    it('should seek backward 10 seconds on thumbstick left', () => {
      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false,
          onAction: onActionCallback as any
        })
      )

      const initialTime = mockVideo.currentTime // 30s

      // Simulate thumbstick left
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onThumbstickLeft()
      })

      expect(mockVideo.currentTime).toBe(initialTime - 10)
      expect(mockVideo.currentTime).toBe(20)
      expect(onActionCallback).toHaveBeenCalledWith({
        type: 'seek-backward',
        source: 'controller',
        value: 10
      })
    })

    it('should clamp forward seek at video duration', () => {
      mockVideo.currentTime = 115 // Near end

      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false,
          onAction: onActionCallback as any
        })
      )

      // Try to seek forward 10 seconds (would go to 125, but should clamp to 120)
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onThumbstickRight()
      })

      expect(mockVideo.currentTime).toBe(120) // Clamped to duration
      expect(onActionCallback).toHaveBeenCalledWith({
        type: 'seek-forward',
        source: 'controller',
        value: 10
      })
    })

    it('should clamp backward seek at 0', () => {
      mockVideo.currentTime = 5 // Near beginning

      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false,
          onAction: onActionCallback as any
        })
      )

      // Try to seek backward 10 seconds (would go to -5, but should clamp to 0)
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onThumbstickLeft()
      })

      expect(mockVideo.currentTime).toBe(0) // Clamped to 0
      expect(onActionCallback).toHaveBeenCalledWith({
        type: 'seek-backward',
        source: 'controller',
        value: 10
      })
    })
  })

  describe('Pointer Awareness', () => {
    it('should pass requirePointerOnTarget to useXRButtons', () => {
      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: true
        })
      )

      expect(mockUseXRButtons).toHaveBeenCalledWith(
        expect.objectContaining({
          requirePointerOn: true
        })
      )
    })

    it('should pass requirePointerOnTarget=false to useXRButtons when disabled', () => {
      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false
        })
      )

      expect(mockUseXRButtons).toHaveBeenCalledWith(
        expect.objectContaining({
          requirePointerOn: false
        })
      )
    })
  })

  describe('Hook Return Values', () => {
    it('should return all values from useXRButtons', () => {
      const { result } = renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false
        })
      )

      expect(result.current.targetRef).toBe(mockXRButtonsReturn.targetRef)
      expect(result.current.onPointerEnter).toBe(mockXRButtonsReturn.onPointerEnter)
      expect(result.current.onPointerLeave).toBe(mockXRButtonsReturn.onPointerLeave)
      expect(result.current.isPointerOnTarget).toBe(true)
    })

    it('should return toggleControlsRef', () => {
      const { result } = renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false
        })
      )

      expect(result.current.toggleControlsRef).toBeDefined()
      expect(result.current.toggleControlsRef.current).toBe(null)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing video gracefully', () => {
      renderHook(() =>
        useVideoXRControls({
          video: undefined,
          requirePointerOnTarget: false,
          onAction: onActionCallback as any
        })
      )

      // Try to trigger actions without video
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      act(() => {
        callbacks.onAPress()
        callbacks.onThumbstickRight()
        callbacks.onThumbstickLeft()
      })

      // Should not throw, and no actions should be called
      expect(onActionCallback).not.toHaveBeenCalled()
    })

    it('should handle missing onAction callback', () => {
      renderHook(() =>
        useVideoXRControls({
          video: mockVideo,
          requirePointerOnTarget: false
        })
      )

      // Should not throw when triggering actions without callback
      const callbacks = (mockXRButtonsReturn as any).__callbacks
      expect(() => {
        act(() => {
          callbacks.onAPress()
        })
      }).not.toThrow()

      expect(mockVideo.play).toHaveBeenCalled()
    })
  })
})
