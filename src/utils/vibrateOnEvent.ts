/**
 * Haptic feedback utility for XR controllers
 *
 * Adapted from @react-three/xr editor example
 * Original: https://github.com/pmndrs/xr/tree/main/examples/editor
 */

import { isXRInputSourceState } from '@react-three/xr'

export interface PulseConfig {
  value?: number
  duration?: number
}

export function vibrateOnEvent(e: any, pulse?: PulseConfig) {
  const value = pulse?.value ?? 0.3
  const duration = pulse?.duration ?? 50

  if (isXRInputSourceState(e.pointerState) && e.pointerState.type === 'controller') {
    e.pointerState.inputSource.gamepad?.hapticActuators[0]?.pulse(value, duration)
  }
}