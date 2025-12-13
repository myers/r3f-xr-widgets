import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useXRSessionModeSupportedPolling } from './useXRSessionModeSupportedPolling'

describe('useXRSessionModeSupportedPolling Hook', () => {
  let mockIsSessionSupported: ReturnType<typeof vi.fn>
  let originalNavigator: typeof navigator

  beforeEach(() => {
    // Save original navigator
    originalNavigator = globalThis.navigator

    // Create mock isSessionSupported function
    mockIsSessionSupported = vi.fn()

    // Mock navigator.xr
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        ...originalNavigator,
        xr: {
          isSessionSupported: mockIsSessionSupported,
          constructor: { name: 'MockXR' }
        }
      },
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    })

    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should return undefined before first check completes', () => {
      mockIsSessionSupported.mockReturnValue(new Promise(() => {})) // Never resolves

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('immersive-vr'))

      expect(result.current).toBeUndefined()
    })
  })

  describe('XR Support Detection', () => {
    it('should return true when XR session is supported', async () => {
      mockIsSessionSupported.mockResolvedValue(true)

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('immersive-vr'))

      await waitFor(() => {
        expect(result.current).toBe(true)
      })

      expect(mockIsSessionSupported).toHaveBeenCalledWith('immersive-vr')
    })

    it('should return false when XR session is not supported', async () => {
      mockIsSessionSupported.mockResolvedValue(false)

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('immersive-vr'))

      await waitFor(() => {
        expect(result.current).toBe(false)
      })

      expect(mockIsSessionSupported).toHaveBeenCalledWith('immersive-vr')
    })

    it('should return false when navigator.xr does not exist', () => {
      // Remove navigator.xr
      Object.defineProperty(globalThis, 'navigator', {
        value: { ...originalNavigator, xr: undefined },
        writable: true,
        configurable: true
      })

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('immersive-vr'))

      expect(result.current).toBe(false)
      expect(mockIsSessionSupported).not.toHaveBeenCalled()
    })

    it('should check immersive-ar mode', async () => {
      mockIsSessionSupported.mockResolvedValue(true)

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('immersive-ar'))

      await waitFor(() => {
        expect(result.current).toBe(true)
      })

      expect(mockIsSessionSupported).toHaveBeenCalledWith('immersive-ar')
    })

    it('should check inline mode', async () => {
      mockIsSessionSupported.mockResolvedValue(true)

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('inline'))

      await waitFor(() => {
        expect(result.current).toBe(true)
      })

      expect(mockIsSessionSupported).toHaveBeenCalledWith('inline')
    })
  })

  describe('Polling Behavior', () => {
    it('should eventually find support when polling', async () => {
      // Simulate delayed support detection
      let callCount = 0
      mockIsSessionSupported.mockImplementation(() => {
        callCount++
        return Promise.resolve(callCount >= 3) // Third call returns true
      })

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('immersive-vr'))

      // Should eventually become true
      await waitFor(
        () => {
          expect(result.current).toBe(true)
        },
        { timeout: 2000 }
      )

      expect(mockIsSessionSupported).toHaveBeenCalled()
      expect(callCount).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Cleanup', () => {
    it('should not update state after unmount', async () => {
      let resolvePromise: (value: boolean) => void
      const promise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve
      })
      mockIsSessionSupported.mockReturnValue(promise)

      const { result, unmount } = renderHook(() => useXRSessionModeSupportedPolling('immersive-vr'))

      expect(result.current).toBeUndefined()

      unmount()

      // Resolve promise after unmount - should not update state
      resolvePromise!(true)
      await new Promise((resolve) => setTimeout(resolve, 50))

      // State should still be undefined (last value before unmount)
      expect(result.current).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should return false when isSessionSupported rejects', async () => {
      mockIsSessionSupported.mockRejectedValue(new Error('XR not available'))

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('immersive-vr'))

      await waitFor(() => {
        expect(result.current).toBe(false)
      })
    })

    it('should continue polling after error', async () => {
      // First call errors, subsequent calls succeed
      let callCount = 0
      mockIsSessionSupported.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error('First error'))
        }
        return Promise.resolve(true)
      })

      const { result } = renderHook(() => useXRSessionModeSupportedPolling('immersive-vr'))

      // Should eventually recover and find support
      await waitFor(
        () => {
          expect(result.current).toBe(true)
        },
        { timeout: 2000 }
      )

      expect(callCount).toBeGreaterThanOrEqual(2)
    })
  })

})
