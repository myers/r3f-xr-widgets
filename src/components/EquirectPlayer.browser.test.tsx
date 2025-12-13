import { describe, it, expect, beforeEach } from 'vitest'
import { render } from 'vitest-browser-react'
import type { XRStore } from '@react-three/xr'
import { XRTestCanvas, findObjectInScene, testVideoUrl } from '../test-utils'
import { createTestXRStore } from '../test-utils/vitest-helpers'
import { EquirectPlayer } from './EquirectPlayer'
import type { Scene } from 'three'

// Constants
const TEST_VIDEO_URL = testVideoUrl // Real 1-second video
const INVALID_VIDEO_URL = 'data:video/mp4;base64,AAAA' // For error cases

describe('EquirectPlayer Browser Test', () => {
  let store: XRStore

  beforeEach(async () => {
    // Create store and wait for iwer (outside React to avoid act() warnings)
    store = await createTestXRStore()
  })

  /**
   * Helper to get the scene from the rendered canvas
   */
  const getScene = (): Scene | null => {
    const canvas = document.querySelector('canvas')
    return (canvas as any)?.__scene ?? null
  }

  describe('Smoke Tests', () => {
    it('should render without crashing', async () => {
      expect(() => {
        render(
          <XRTestCanvas store={store}>
            <EquirectPlayer videoUrl={TEST_VIDEO_URL} />
          </XRTestCanvas>
        )
      }).not.toThrow()
    })

    it('should render with all custom props', async () => {
      expect(() => {
        render(
          <XRTestCanvas store={store}>
            <EquirectPlayer
              videoUrl={TEST_VIDEO_URL}
              title="Full Test"
              videoAngle={180}
              layout="stereo-left-right"
            />
          </XRTestCanvas>
        )
      }).not.toThrow()
    })
  })

  describe('Scene Structure', () => {
    it('should render all required scene objects', async () => {
      render(
        <XRTestCanvas store={store}>
          <EquirectPlayer videoUrl={TEST_VIDEO_URL} />
        </XRTestCanvas>
      )

      // Wait for scene to be available
      await expect.poll(() => getScene()).not.toBeNull()
      const scene = getScene()!

      // Verify all required objects are present (names derived from object3DName)
      expect(findObjectInScene(scene, 'equirect-player')).not.toBeNull()
      expect(findObjectInScene(scene, 'equirect-player-action-indicator')).not.toBeNull()
      expect(findObjectInScene(scene, 'equirect-player-control-panel')).not.toBeNull()
    })
  })

  describe('Video Loading', () => {
    it('should render XRLayer after video metadata loads', async () => {
      render(
        <XRTestCanvas store={store}>
          <EquirectPlayer videoUrl={TEST_VIDEO_URL} />
        </XRTestCanvas>
      )

      // Wait for scene to be available
      await expect.poll(() => getScene()).not.toBeNull()
      const scene = getScene()!

      // Poll for layer to appear (requires video metadata)
      await expect.poll(
        () => findObjectInScene(scene, 'equirect-player-layer'),
        { timeout: 5000 }
      ).not.toBeNull()
    })

    it('should not render XRLayer with invalid video URL', async () => {
      render(
        <XRTestCanvas store={store}>
          <EquirectPlayer videoUrl={INVALID_VIDEO_URL} />
        </XRTestCanvas>
      )

      // Wait for scene to be available
      await expect.poll(() => getScene()).not.toBeNull()
      const scene = getScene()!

      // Wait a bit for any potential loading
      await new Promise(resolve => setTimeout(resolve, 500))

      // XRLayer should not be present (no dimensions from invalid video)
      expect(findObjectInScene(scene, 'equirect-player-layer')).toBeNull()
    })
  })

  describe('Props', () => {
    it('should pass title to control panel', async () => {
      render(
        <XRTestCanvas store={store}>
          <EquirectPlayer videoUrl={TEST_VIDEO_URL} title="Test Title" />
        </XRTestCanvas>
      )

      await expect.poll(() => getScene()).not.toBeNull()
      const scene = getScene()!

      // Verify control panel title element exists (uses derived name from object3DName)
      const controlPanelTitle = findObjectInScene(scene, 'equirect-player-control-panel-title')
      expect(controlPanelTitle).not.toBeNull()
    })

    it('should use custom videoAngle', async () => {
      render(
        <XRTestCanvas store={store}>
          <EquirectPlayer videoUrl={TEST_VIDEO_URL} videoAngle={360} />
        </XRTestCanvas>
      )

      await expect.poll(() => getScene()).not.toBeNull()
      const scene = getScene()!

      // XRLayer should be present with custom angle
      await expect.poll(
        () => findObjectInScene(scene, 'equirect-player-layer'),
        { timeout: 5000 }
      ).not.toBeNull()
    })
  })
})
