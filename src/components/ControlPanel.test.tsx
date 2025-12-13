import { describe, it, expect } from 'vitest'
import { renderUIKit, createMockVideo } from '../test-utils'
import { ControlPanel, ControlPanelCard } from './ControlPanel'

describe('ControlPanel Component', () => {
  describe('Rendering', () => {
    it('should render control panel with all buttons', async () => {
      const name = 'test-all-buttons'
      const mockVideo = createMockVideo()

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} title="Test Video" object3DName={name} />
      )

      // Verify all three buttons are in the scene
      const rewindButton = renderer.scene.find(node => node.instance.name === `${name}-rewind`)
      const playPauseButton = renderer.scene.find(node => node.instance.name === `${name}-play-pause`)
      const fastForwardButton = renderer.scene.find(node => node.instance.name === `${name}-fast-forward`)

      expect(rewindButton).toBeDefined()
      expect(playPauseButton).toBeDefined()
      expect(fastForwardButton).toBeDefined()
    })

    it('should render with title when provided', async () => {
      const mockVideo = createMockVideo()
      const name = 'test-title-provided'

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} title="My Video" object3DName={name} />
      )

      // Title element should be present in the scene
      const titleElements = renderer.scene.findAll(node => node.instance.name === `${name}-title`)
      expect(titleElements.length).toBe(1)
    })

    it('should render without title when not provided', async () => {
      const mockVideo = createMockVideo()
      const name = 'test-no-title'

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} object3DName={name} />
      )

      // Title element should NOT be present in the scene
      const titleElements = renderer.scene.findAll(node => node.instance.name === `${name}-title`)
      expect(titleElements.length).toBe(0)
    })

    it('should render without video prop', async () => {
      const name = 'test-no-video'

      const renderer = await renderUIKit(
        <ControlPanel object3DName={name} />
      )

      // All buttons should still render
      const rewindButton = renderer.scene.find(node => node.instance.name === `${name}-rewind`)
      const playPauseButton = renderer.scene.find(node => node.instance.name === `${name}-play-pause`)
      const fastForwardButton = renderer.scene.find(node => node.instance.name === `${name}-fast-forward`)

      expect(rewindButton).toBeDefined()
      expect(playPauseButton).toBeDefined()
      expect(fastForwardButton).toBeDefined()
    })

    it('should handle button clicks without video prop (no-op)', async () => {
      const name = 'test-no-video-clicks'

      const renderer = await renderUIKit(
        <ControlPanel object3DName={name} />
      )

      // Click all buttons - should not throw
      const rewindButton = renderer.scene.find(node => node.instance.name === `${name}-rewind`)
      const playPauseButton = renderer.scene.find(node => node.instance.name === `${name}-play-pause`)
      const fastForwardButton = renderer.scene.find(node => node.instance.name === `${name}-fast-forward`)

      await renderer.fireEvent(rewindButton, 'click')
      await renderer.fireEvent(playPauseButton, 'click')
      await renderer.fireEvent(fastForwardButton, 'click')

      // No assertions needed - test passes if no errors thrown
    })
  })

  describe('Play/Pause Button', () => {
    it('should play video when play button clicked', async () => {
      const mockVideo = createMockVideo({ paused: true })
      const name = 'test-play-pause'

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} title="Test" object3DName={name} />
      )

      // Find and click the play/pause button
      const playPauseButton = renderer.scene.find(node => node.instance.name === `${name}-play-pause`)
      expect(playPauseButton).toBeDefined()

      await renderer.fireEvent(playPauseButton, 'click')

      // Verify video.play() was called
      expect(mockVideo.play).toHaveBeenCalled()
      expect(mockVideo.paused).toBe(false)
    })

    it('should pause video when pause button clicked', async () => {
      const mockVideo = createMockVideo({ paused: true })
      const name = 'test-pause'

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} object3DName={name} />
      )

      // Click to play first
      const playPauseButton = renderer.scene.find(node => node.instance.name === `${name}-play-pause`)
      await renderer.fireEvent(playPauseButton, 'click')
      expect(mockVideo.paused).toBe(false)

      // Click again to pause
      await renderer.fireEvent(playPauseButton, 'click')
      expect(mockVideo.pause).toHaveBeenCalled()
      expect(mockVideo.paused).toBe(true)
    })
  })

  describe('Seek Controls', () => {
    it('should allow seeking forward', async () => {
      const mockVideo = createMockVideo({ currentTime: 30, duration: 120 })
      const name = 'test-seek-forward'

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} object3DName={name} />
      )

      const initialTime = mockVideo.currentTime

      // Find and click fast forward button
      const fastForwardButton = renderer.scene.find(node => node.instance.name === `${name}-fast-forward`)
      expect(fastForwardButton).toBeDefined()

      await renderer.fireEvent(fastForwardButton, 'click')

      // Verify currentTime was advanced by 10 seconds (30 -> 40)
      expect(mockVideo.currentTime).toBe(initialTime + 10)
    })

    it('should allow seeking backward', async () => {
      const mockVideo = createMockVideo({ currentTime: 30, duration: 120 })
      const name = 'test-seek-backward'

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} object3DName={name} />
      )

      const initialTime = mockVideo.currentTime

      // Find and click rewind button
      const rewindButton = renderer.scene.find(node => node.instance.name === `${name}-rewind`)
      expect(rewindButton).toBeDefined()

      await renderer.fireEvent(rewindButton, 'click')

      // Verify currentTime was moved back by 10 seconds (30 -> 20)
      expect(mockVideo.currentTime).toBe(initialTime - 10)
    })

    it('should clamp forward seek at duration', async () => {
      const mockVideo = createMockVideo({ currentTime: 115, duration: 120 })
      const name = 'test-seek-clamp-forward'

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} object3DName={name} />
      )

      // Click fast forward button
      const fastForwardButton = renderer.scene.find(node => node.instance.name === `${name}-fast-forward`)
      await renderer.fireEvent(fastForwardButton, 'click')

      // Verify currentTime was clamped to duration
      expect(mockVideo.currentTime).toBe(120)  // Clamped to duration
    })

    it('should clamp backward seek at 0', async () => {
      const mockVideo = createMockVideo({ currentTime: 5, duration: 120 })
      const name = 'test-seek-clamp-backward'

      const renderer = await renderUIKit(
        <ControlPanel video={mockVideo} object3DName={name} />
      )

      // Click rewind button
      const rewindButton = renderer.scene.find(node => node.instance.name === `${name}-rewind`)
      await renderer.fireEvent(rewindButton, 'click')

      // Verify currentTime was clamped to 0
      expect(mockVideo.currentTime).toBe(0)  // Clamped to 0
    })
  })

  describe('ControlPanelCard Variant', () => {
    it('should render ControlPanel inside card wrapper', async () => {
      const mockVideo = createMockVideo()
      const name = 'test-card'

      const renderer = await renderUIKit(
        <ControlPanelCard video={mockVideo} object3DName={name} />
      )

      // ControlPanelCard should render the inner ControlPanel with all its buttons
      const rewindButton = renderer.scene.find(node => node.instance.name === `${name}-rewind`)
      const playPauseButton = renderer.scene.find(node => node.instance.name === `${name}-play-pause`)
      const fastForwardButton = renderer.scene.find(node => node.instance.name === `${name}-fast-forward`)

      expect(rewindButton).toBeDefined()
      expect(playPauseButton).toBeDefined()
      expect(fastForwardButton).toBeDefined()
    })

    it('should render title when provided to card', async () => {
      const mockVideo = createMockVideo()
      const name = 'test-card-title'

      const renderer = await renderUIKit(
        <ControlPanelCard video={mockVideo} title="Card Title" object3DName={name} />
      )

      // Title should be visible in the card variant
      const titleElements = renderer.scene.findAll(node => node.instance.name === `${name}-title`)
      expect(titleElements.length).toBe(1)
    })

    it('should accept opacity prop', async () => {
      const mockVideo = createMockVideo()
      const name = 'test-card-opacity'

      // Should render without errors with custom opacity
      const renderer = await renderUIKit(
        <ControlPanelCard video={mockVideo} opacity={0.5} object3DName={name} />
      )

      // Verify component renders with opacity prop
      const playPauseButton = renderer.scene.find(node => node.instance.name === `${name}-play-pause`)
      expect(playPauseButton).toBeDefined()
    })
  })

})
