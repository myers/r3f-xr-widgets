/**
 * Haptic feedback utility for XR controllers
 *
 * Adapted from @react-three/xr editor example
 * @see {@link https://github.com/pmndrs/xr/tree/main/examples/editor}
 */

import { isXRInputSourceState } from '@react-three/xr'

/**
 * Configuration for haptic pulse feedback
 */
export interface PulseConfig {
  /** Pulse intensity (0.0 to 1.0). Defaults to 0.3 */
  value?: number
  /** Pulse duration in milliseconds. Defaults to 50 */
  duration?: number
}

/**
 * Trigger haptic feedback on XR controllers when an event occurs.
 *
 * Uses the WebXR Gamepad API's `hapticActuators[0].pulse()` method to provide
 * tactile feedback to users in VR/AR. Only triggers if the event comes from
 * an XR controller input source.
 *
 * @param e - Pointer event from React Three Fiber interaction
 * @param pulse - Optional pulse configuration (intensity and duration)
 *
 * @example
 * ```tsx
 * import { vibrateOnEvent } from 'r3f-xr-widgets'
 *
 * <mesh onPointerDown={(e) => vibrateOnEvent(e)}>
 *   <boxGeometry />
 * </mesh>
 *
 * // Custom intensity and duration
 * <mesh onPointerDown={(e) => vibrateOnEvent(e, { value: 0.8, duration: 100 })}>
 *   <boxGeometry />
 * </mesh>
 * ```
 */
export function vibrateOnEvent(e: any, pulse?: PulseConfig) {
  const value = pulse?.value ?? 0.3
  const duration = pulse?.duration ?? 50

  if (isXRInputSourceState(e.pointerState) && e.pointerState.type === 'controller') {
    e.pointerState.inputSource.gamepad?.hapticActuators[0]?.pulse(value, duration)
  }
}