import { useCallback, useRef } from 'react'
import { useXRButtons } from './useXRButtons'
import type { UseXRButtonsReturn } from './useXRButtons'

/**
 * Playback action event dispatched by useVideoXRControls
 * @group Types
 */
export type PlaybackAction = {
  /** Type of playback action that occurred */
  type: 'play' | 'pause' | 'seek-forward' | 'seek-backward' | 'toggle-controls'
  /** Source of the action (always 'controller' for this hook) */
  source: 'controller'
  /** Optional numeric value (e.g., seek amount in seconds) */
  value?: number
}

/**
 * Configuration options for useVideoXRControls hook
 * @group Types
 */
export interface UseVideoXRControlsOptions {
  /** HTML video element to control */
  video?: HTMLVideoElement | null
  /** If true, only trigger controls when pointer is on target @default true */
  requirePointerOnTarget?: boolean
  /** Callback fired when a playback action occurs */
  onAction?: (action: PlaybackAction) => void
}

/**
 * Return value from useVideoXRControls hook
 * @group Types
 */
export interface UseVideoXRControlsReturn extends UseXRButtonsReturn {
  /** Ref that can be populated with a toggle function from ControlPanelAutoFade */
  toggleControlsRef: React.MutableRefObject<(() => void) | null>
}

/**
 * Hook for controlling video playback via XR controller buttons
 *
 * Provides a pre-configured button mapping for video playback control in XR:
 * - **A button**: Play/pause toggle
 * - **B button**: Toggle controls panel visibility
 * - **Thumbstick right**: Seek forward 10 seconds
 * - **Thumbstick left**: Seek backward 10 seconds
 *
 * Built on top of {@link useXRButtons} with fixed button assignments optimized for
 * video playback. Commonly used with EquirectPlayer and other video components.
 *
 * @group Hooks
 *
 * @param options - Configuration with video element and callbacks
 * @returns Object with targetRef, pointer handlers, and controls toggle ref
 *
 * @example Basic usage with video element
 * ```tsx
 * import { useVideoXRControls } from 'r3f-xr-widgets'
 *
 * function VideoScene() {
 *   const videoRef = useRef<HTMLVideoElement>(null)
 *   const { targetRef, onPointerEnter, onPointerLeave } = useVideoXRControls({
 *     video: videoRef.current,
 *     onAction: (action) => console.log('Action:', action.type)
 *   })
 *
 *   return (
 *     <>
 *       <video ref={videoRef} src="/video.mp4" />
 *       <mesh
 *         ref={targetRef}
 *         onPointerEnter={onPointerEnter}
 *         onPointerLeave={onPointerLeave}
 *       >
 *         <sphereGeometry args={[10, 64, 64]} />
 *         <meshBasicMaterial>
 *           <videoTexture attach="map" args={[videoRef.current]} />
 *         </meshBasicMaterial>
 *       </mesh>
 *     </>
 *   )
 * }
 * ```
 *
 * @example Global controls (works anywhere in scene)
 * ```tsx
 * const controls = useVideoXRControls({
 *   video: videoElement,
 *   requirePointerOnTarget: false
 * })
 * ```
 *
 * @see {@link useXRButtons} for the underlying button detection hook
 * @see {@link EquirectPlayer} for a complete video player implementation
 */
export function useVideoXRControls({
  video,
  requirePointerOnTarget = true,
  onAction
}: UseVideoXRControlsOptions = {}): UseVideoXRControlsReturn {
  // Ref to hold toggle function from ControlPanelAutoFade
  const toggleControlsRef = useRef<(() => void) | null>(null)

  // Handle play/pause (A button)
  const handlePlayPause = useCallback(() => {
    if (!video) return

    if (video.paused) {
      video.play()
      onAction?.({ type: 'play', source: 'controller' })
    } else {
      video.pause()
      onAction?.({ type: 'pause', source: 'controller' })
    }
  }, [video, onAction])

  // Handle controls toggle (B button)
  const handleToggleControls = useCallback(() => {
    // Call the toggle function from ControlPanelAutoFade
    toggleControlsRef.current?.()
    onAction?.({ type: 'toggle-controls', source: 'controller' })
  }, [onAction])

  // Handle seek forward (thumbstick right)
  const handleSeekForward = useCallback(() => {
    if (!video) return

    const seekAmount = 10
    video.currentTime = Math.min(video.duration, video.currentTime + seekAmount)
    onAction?.({ type: 'seek-forward', source: 'controller', value: seekAmount })
  }, [video, onAction])

  // Handle seek backward (thumbstick left)
  const handleSeekBackward = useCallback(() => {
    if (!video) return

    const seekAmount = 10
    video.currentTime = Math.max(0, video.currentTime - seekAmount)
    onAction?.({ type: 'seek-backward', source: 'controller', value: seekAmount })
  }, [video, onAction])

  // Use useXRButtons with fixed button mapping
  const xrButtons = useXRButtons({
    onAPress: handlePlayPause,
    onBPress: handleToggleControls,
    onThumbstickRight: handleSeekForward,
    onThumbstickLeft: handleSeekBackward,
    requirePointerOn: requirePointerOnTarget
  })

  // Return all useXRButtons values plus toggleControlsRef
  return {
    ...xrButtons,
    toggleControlsRef
  }
}
