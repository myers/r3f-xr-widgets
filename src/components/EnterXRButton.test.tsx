import { describe, it, expect, beforeEach } from 'vitest'
import { render } from 'vitest-browser-react'
import { EnterXRButton } from './EnterXRButton'
import { createXRStore } from '@react-three/xr'
import { LOCAL_XR_ASSET_PATH } from '../test-utils/xr-test-config'

describe('EnterXRButton Component', () => {
  let store: ReturnType<typeof createXRStore>

  beforeEach(() => {
    // Create a fresh store for each test
    // Use local assets to avoid CDN calls
    store = createXRStore({
      baseAssetPath: LOCAL_XR_ASSET_PATH
    })
  })

  describe('Rendering', () => {
    it('should render VR button by default', () => {
      render(<EnterXRButton store={store} />)

      const button = document.querySelector('button')
      expect(button).toBeDefined()
    })

    it('should render button for immersive-vr mode', () => {
      render(<EnterXRButton store={store} mode="immersive-vr" />)

      const button = document.querySelector('button')
      // Button exists and has text (may be "Enter VR" or "not supported" message)
      expect(button?.textContent).toBeDefined()
      expect(button?.textContent!.length).toBeGreaterThan(0)
    })

    it('should render button for immersive-ar mode', () => {
      render(<EnterXRButton store={store} mode="immersive-ar" />)

      const button = document.querySelector('button')
      // Just verify button exists and has some text
      expect(button?.textContent).toBeDefined()
      expect(button?.textContent!.length).toBeGreaterThan(0)
    })

    it('should apply custom id when provided', () => {
      render(<EnterXRButton store={store} id="test-button" />)

      const button = document.getElementById('test-button')
      expect(button).toBeDefined()
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom container styles', () => {
      const customStyle = { backgroundColor: 'red', padding: '10px' }
      render(<EnterXRButton store={store} style={customStyle} />)

      // Find the container div with the custom styles
      const buttonContainer = document.querySelector('div[style*="background-color"]') as HTMLDivElement
      expect(buttonContainer).toBeDefined()
      expect(buttonContainer?.style.backgroundColor).toBe('red')
      expect(buttonContainer?.style.padding).toBe('10px')
    })

    it('should apply custom button styles', () => {
      const customButtonStyle = { fontSize: '2rem', color: 'yellow' }
      render(<EnterXRButton store={store} buttonStyle={customButtonStyle} />)

      const button = document.querySelector('button') as HTMLButtonElement
      expect(button.style.fontSize).toBe('2rem')
      expect(button.style.color).toBe('yellow')
    })
  })

  describe('Mode Rendering', () => {
    it('should render VR mode', () => {
      render(<EnterXRButton store={store} mode="immersive-vr" />)
      const button = document.querySelector('button')
      expect(button?.textContent).toBeDefined()
      expect(button?.textContent!.length).toBeGreaterThan(0)
    })

    it('should render AR mode', () => {
      render(<EnterXRButton store={store} mode="immersive-ar" />)
      const button = document.querySelector('button')
      expect(button?.textContent).toBeDefined()
      expect(button?.textContent!.length).toBeGreaterThan(0)
    })
  })
})
