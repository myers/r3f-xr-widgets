import { mock } from 'vitest-mock-extended'
import { vi } from 'vitest'

/**
 * Configuration options for creating a mock HTMLVideoElement
 */
export interface MockVideoOptions {
  /** Current playback position in seconds (default: 0) */
  currentTime?: number
  /** Total duration in seconds (default: 120) */
  duration?: number
  /** Whether video is paused (default: true) */
  paused?: boolean
  /** Whether video is muted (default: false) */
  muted?: boolean
  /** Volume level 0-1 (default: 0.5) */
  volume?: number
  /** How much video is buffered in seconds (default: 60) */
  bufferedEnd?: number
  /** Video frame width in pixels (default: 1920) */
  videoWidth?: number
  /** Video frame height in pixels (default: 1080) */
  videoHeight?: number
  /** Ready state of the video (default: 0 - HAVE_NOTHING) */
  readyState?: number
}

/**
 * Creates a type-safe mock HTMLVideoElement for testing.
 *
 * This mock includes:
 * - Standard video properties (currentTime, duration, paused, muted, volume)
 * - Buffered time ranges interface
 * - Mock play/pause methods that update state
 * - Event dispatching simulation
 *
 * @param options - Configuration for the mock video element
 * @returns A vitest-mock-extended mock of HTMLVideoElement
 *
 * @example
 * ```typescript
 * const video = createMockVideo({
 *   currentTime: 30,
 *   duration: 120,
 *   paused: true
 * })
 *
 * await video.play()
 * expect(video.play).toHaveBeenCalled()
 * expect(video.paused).toBe(false)
 * ```
 */
export function createMockVideo(options: MockVideoOptions = {}): HTMLVideoElement {
  const {
    currentTime = 0,
    duration = 120,
    paused = true,
    muted = false,
    volume = 0.5,
    bufferedEnd = 60,
    videoWidth = 1920,
    videoHeight = 1080,
    readyState = 0
  } = options

  // Create base mock
  const mockVideo = mock<HTMLVideoElement>()

  // Track internal state
  let internalCurrentTime = currentTime
  let internalPaused = paused
  let internalMuted = muted
  let internalVolume = volume
  let internalReadyState = readyState

  // Mock currentTime (getter/setter)
  Object.defineProperty(mockVideo, 'currentTime', {
    get: () => internalCurrentTime,
    set: (value: number) => {
      internalCurrentTime = value
    },
    configurable: true
  })

  // Mock duration (readonly)
  Object.defineProperty(mockVideo, 'duration', {
    get: () => duration,
    configurable: true
  })

  // Mock paused (readonly, changes via play/pause)
  Object.defineProperty(mockVideo, 'paused', {
    get: () => internalPaused,
    configurable: true
  })

  // Mock muted (getter/setter)
  Object.defineProperty(mockVideo, 'muted', {
    get: () => internalMuted,
    set: (value: boolean) => {
      internalMuted = value
    },
    configurable: true
  })

  // Mock volume (getter/setter)
  Object.defineProperty(mockVideo, 'volume', {
    get: () => internalVolume,
    set: (value: number) => {
      internalVolume = value
    },
    configurable: true
  })

  // Mock buffered TimeRanges
  Object.defineProperty(mockVideo, 'buffered', {
    value: {
      length: 1,
      start: () => 0,
      end: () => bufferedEnd
    },
    configurable: true
  })

  // Mock videoWidth (readonly)
  Object.defineProperty(mockVideo, 'videoWidth', {
    get: () => videoWidth,
    configurable: true
  })

  // Mock videoHeight (readonly)
  Object.defineProperty(mockVideo, 'videoHeight', {
    get: () => videoHeight,
    configurable: true
  })

  // Mock readyState (getter/setter to allow tests to update it)
  Object.defineProperty(mockVideo, 'readyState', {
    get: () => internalReadyState,
    set: (value: number) => {
      internalReadyState = value
    },
    configurable: true
  })

  // Mock addEventListener/removeEventListener
  const eventListeners = new Map<string, Set<EventListener>>()

  mockVideo.addEventListener = vi.fn((event: string, listener: EventListener) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set())
    }
    eventListeners.get(event)!.add(listener)
  }) as any

  mockVideo.removeEventListener = vi.fn((event: string, listener: EventListener) => {
    eventListeners.get(event)?.delete(listener)
  }) as any

  mockVideo.dispatchEvent = vi.fn((event: Event) => {
    const listeners = eventListeners.get(event.type)
    if (listeners) {
      listeners.forEach(listener => listener(event))
    }
    return true
  }) as any

  // Mock play method
  mockVideo.play = vi.fn().mockImplementation(() => {
    internalPaused = false
    return Promise.resolve()
  }) as any

  // Mock pause method
  mockVideo.pause = vi.fn().mockImplementation(() => {
    internalPaused = true
  }) as any

  return mockVideo
}
