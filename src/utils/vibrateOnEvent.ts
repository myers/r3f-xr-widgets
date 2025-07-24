import { isXRInputSourceState } from '@react-three/xr'

export function vibrateOnEvent(e: any) {
  if (isXRInputSourceState(e.pointerState) && e.pointerState.type === 'controller') {
    e.pointerState.inputSource.gamepad?.hapticActuators[0]?.pulse(0.3, 50)
  }
}