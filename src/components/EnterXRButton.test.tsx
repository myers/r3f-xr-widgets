import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, act } from '@testing-library/react'
import { EnterXRButton } from './EnterXRButton'
import type { XRStore } from '@react-three/xr'

// Mock the useXRSessionModeSupportedPolling hook
vi.mock('../hooks/useXRSessionModeSupportedPolling', () => ({
  useXRSessionModeSupportedPolling: vi.fn()
}))

import { useXRSessionModeSupportedPolling } from '../hooks/useXRSessionModeSupportedPolling'
const mockUseXRSessionModeSupportedPolling = vi.mocked(useXRSessionModeSupportedPolling)

describe('EnterXRButton Component', () => {
  let mockStore: XRStore
  let mockSubscribe: ReturnType<typeof vi.fn>
  let mockGetState: ReturnType<typeof vi.fn>
  let mockEnterXR: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    cleanup() // Clean up DOM between tests

    // Create mock store methods
    mockSubscribe = vi.fn(() => vi.fn()) // Returns unsubscribe function
    mockGetState = vi.fn(() => ({ session: undefined }))
    mockEnterXR = vi.fn(() => Promise.resolve())

    // Create mock XR store
    mockStore = {
      subscribe: mockSubscribe,
      getState: mockGetState,
      enterXR: mockEnterXR
    } as unknown as XRStore

    // Default: session is supported
    mockUseXRSessionModeSupportedPolling.mockReturnValue(true)
  })

  afterEach(() => {
    cleanup()
  })

  describe('Rendering', () => {
    it('should render VR button by default', () => {
      render(<EnterXRButton store={mockStore} />)

      const button = screen.getByRole('button')
      expect(button).toBeDefined()
      expect(button.textContent).toBe('Enter VR')
    })

    it('should render button for immersive-vr mode', () => {
      render(<EnterXRButton store={mockStore} mode="immersive-vr" />)

      const button = screen.getByRole('button')
      expect(button.textContent).toBe('Enter VR')
    })

    it('should render button for immersive-ar mode', () => {
      render(<EnterXRButton store={mockStore} mode="immersive-ar" />)

      const button = screen.getByRole('button')
      expect(button.textContent).toBe('Enter AR')
    })

    it('should apply custom id when provided', () => {
      render(<EnterXRButton store={mockStore} id="test-button" />)

      const button = document.getElementById('test-button')
      expect(button).toBeDefined()
      expect(button?.tagName).toBe('BUTTON')
    })

    it('should show unsupported message when XR is not supported', () => {
      mockUseXRSessionModeSupportedPolling.mockReturnValue(false)

      render(<EnterXRButton store={mockStore} />)

      const button = screen.getByRole('button')
      expect(button.textContent).toBe("Your Browser Doesn't Support WebXR")
      expect(button).toHaveProperty('disabled', true)
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom container styles', () => {
      const customStyle = { backgroundColor: 'red', padding: '10px' }
      render(<EnterXRButton store={mockStore} style={customStyle} />)

      const container = screen.getByRole('button').parentElement as HTMLDivElement
      expect(container).toBeDefined()
      expect(container?.style.backgroundColor).toBe('red')
      expect(container?.style.padding).toBe('10px')
    })

    it('should apply custom button styles', () => {
      const customButtonStyle = { fontSize: '2rem', color: 'yellow' }
      render(<EnterXRButton store={mockStore} buttonStyle={customButtonStyle} />)

      const button = screen.getByRole('button') as HTMLButtonElement
      expect(button.style.fontSize).toBe('2rem')
      expect(button.style.color).toBe('yellow')
    })

    it('should apply disabled styles when not supported', () => {
      mockUseXRSessionModeSupportedPolling.mockReturnValue(false)

      render(<EnterXRButton store={mockStore} />)

      const button = screen.getByRole('button') as HTMLButtonElement
      expect(button.style.background).toBe('rgb(204, 204, 204)')
      expect(button.style.cursor).toBe('not-allowed')
      expect(button.style.opacity).toBe('0.7')
    })
  })

  describe('Session State', () => {
    it('should hide when session is active', () => {
      mockGetState.mockReturnValue({ session: {} }) // Active session

      const { container } = render(<EnterXRButton store={mockStore} />)

      // Component returns null when in session
      expect(container.firstChild).toBeNull()
    })

    it('should show when session is not active', () => {
      mockGetState.mockReturnValue({ session: undefined }) // No session

      render(<EnterXRButton store={mockStore} />)

      const button = screen.getByRole('button')
      expect(button).toBeDefined()
    })

    it('should hide when session becomes active after render', () => {
      let subscribeCallback: () => void
      mockSubscribe.mockImplementation((callback) => {
        subscribeCallback = callback
        return vi.fn()
      })
      mockGetState.mockReturnValue({ session: undefined })

      const { container } = render(<EnterXRButton store={mockStore} />)

      // Button should be visible initially
      expect(screen.getByRole('button')).toBeDefined()

      // Simulate session starting
      mockGetState.mockReturnValue({ session: {} })
      act(() => {
        subscribeCallback!()
      })

      // Button should now be hidden
      expect(container.firstChild).toBeNull()
    })

    it('should unsubscribe on unmount', () => {
      const unsubscribe = vi.fn()
      mockSubscribe.mockReturnValue(unsubscribe)

      const { unmount } = render(<EnterXRButton store={mockStore} />)

      unmount()

      expect(unsubscribe).toHaveBeenCalled()
    })
  })

  describe('Mode Rendering', () => {
    it('should check support for VR mode', () => {
      render(<EnterXRButton store={mockStore} mode="immersive-vr" />)

      expect(mockUseXRSessionModeSupportedPolling).toHaveBeenCalledWith('immersive-vr')
    })

    it('should check support for AR mode', () => {
      render(<EnterXRButton store={mockStore} mode="immersive-ar" />)

      expect(mockUseXRSessionModeSupportedPolling).toHaveBeenCalledWith('immersive-ar')
    })
  })

  describe('Click Handling', () => {
    it('should call store.enterXR when clicked', async () => {
      render(<EnterXRButton store={mockStore} mode="immersive-vr" />)

      const button = screen.getByRole('button')
      await button.click()

      expect(mockEnterXR).toHaveBeenCalledWith('immersive-vr')
    })

    it('should call store.enterXR with AR mode', async () => {
      render(<EnterXRButton store={mockStore} mode="immersive-ar" />)

      const button = screen.getByRole('button')
      await button.click()

      expect(mockEnterXR).toHaveBeenCalledWith('immersive-ar')
    })

    it('should not be clickable when disabled', () => {
      mockUseXRSessionModeSupportedPolling.mockReturnValue(false)

      render(<EnterXRButton store={mockStore} />)

      const button = screen.getByRole('button') as HTMLButtonElement
      expect(button.disabled).toBe(true)
    })
  })
})
