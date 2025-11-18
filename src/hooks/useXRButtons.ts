import { RefObject, useState, useRef, useCallback } from 'react'
import { Object3D } from 'three'
import { useXRInputSourceState } from '@react-three/xr'
import { useFrame } from '@react-three/fiber'
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:hooks:xr-buttons')

/**
 * Configuration options for useXRButtons hook
 * @group Types
 */
export interface UseXRButtonsOptions {
  /** Callback when A button is pressed on either controller */
  onAPress?: () => void
  /** Callback when B button is pressed on either controller */
  onBPress?: () => void
  /** Callback when X button is pressed on either controller */
  onXPress?: () => void
  /** Callback when Y button is pressed on either controller */
  onYPress?: () => void

  /** Callback when thumbstick pushed up past threshold (0.7) on either controller */
  onThumbstickUp?: () => void
  /** Callback when thumbstick pushed down past threshold (0.7) on either controller */
  onThumbstickDown?: () => void
  /** Callback when thumbstick pushed left past threshold (0.7) on either controller */
  onThumbstickLeft?: () => void
  /** Callback when thumbstick pushed right past threshold (0.7) on either controller */
  onThumbstickRight?: () => void

  /** If true, only trigger callbacks when pointer is on target. @default true */
  requirePointerOn?: boolean
}

/**
 * Return value from useXRButtons hook
 * @group Types
 */
export interface UseXRButtonsReturn {
  /** Ref to attach to the target mesh for pointer tracking */
  targetRef: RefObject<Object3D | null>
  /** Handler to call on pointer enter events */
  onPointerEnter: () => void
  /** Handler to call on pointer leave events */
  onPointerLeave: () => void
  /** Current pointer state (true if pointer is on target) */
  isPointerOnTarget: boolean
}

// Button state tracking for edge detection
interface ButtonStates {
  [key: string]: boolean
  a: boolean
  b: boolean
  x: boolean
  y: boolean
}

// Thumbstick state tracking for edge-triggered behavior
interface ThumbstickStates {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

const THUMBSTICK_THRESHOLD = 0.7

/**
 * Hook for monitoring XR controller button presses and thumbstick gestures
 *
 * Monitors both left and right XR controllers simultaneously and triggers callbacks when
 * buttons are pressed or thumbsticks are moved past threshold. All callbacks are edge-triggered
 * (fire once per button press, not continuously while held).
 *
 * Features:
 * - Monitors A, B, X, Y buttons from either controller
 * - Thumbstick gestures (up/down/left/right) with 0.7 threshold
 * - Optional pointer-on-target gating for selective activation
 * - Edge-triggered callbacks (fires once per press/gesture)
 * - Returns targetRef and pointer handlers for easy integration
 *
 * @group Hooks
 *
 * @param options - Configuration with button/thumbstick callbacks and pointer requirements
 * @returns Object with targetRef and pointer event handlers to attach to your mesh
 *
 * @example Basic button handling
 * ```tsx
 * import { useXRButtons } from 'r3f-xr-widgets'
 *
 * function InteractiveMesh() {
 *   const { targetRef, onPointerEnter, onPointerLeave } = useXRButtons({
 *     onAPress: () => console.log('A pressed'),
 *     onBPress: () => console.log('B pressed'),
 *     onThumbstickUp: () => console.log('Thumbstick up')
 *   })
 *
 *   return (
 *     <mesh
 *       ref={targetRef}
 *       onPointerEnter={onPointerEnter}
 *       onPointerLeave={onPointerLeave}
 *     >
 *       <boxGeometry />
 *       <meshStandardMaterial />
 *     </mesh>
 *   )
 * }
 * ```
 *
 * @example Global controls (no pointer requirement)
 * ```tsx
 * const { targetRef } = useXRButtons({
 *   onAPress: handlePlay,
 *   requirePointerOn: false // Trigger even when not pointing at target
 * })
 * ```
 */
export function useXRButtons(
  options: UseXRButtonsOptions = {}
): UseXRButtonsReturn {
  const {
    onAPress,
    onBPress,
    onXPress,
    onYPress,
    onThumbstickUp,
    onThumbstickDown,
    onThumbstickLeft,
    onThumbstickRight,
    requirePointerOn = true
  } = options

  // Create targetRef internally
  const targetRef = useRef<Object3D>(null)

  // Track pointer state
  const [isPointerOnTarget, setIsPointerOnTarget] = useState(false)

  // Track previous button states for edge detection (both controllers)
  const leftButtonStates = useRef<ButtonStates>({ a: false, b: false, x: false, y: false })
  const rightButtonStates = useRef<ButtonStates>({ a: false, b: false, x: false, y: false })

  // Track thumbstick states for edge-triggered behavior (both controllers)
  const leftThumbstickStates = useRef<ThumbstickStates>({ up: false, down: false, left: false, right: false })
  const rightThumbstickStates = useRef<ThumbstickStates>({ up: false, down: false, left: false, right: false })

  // Get controller states from @react-three/xr
  const leftController = useXRInputSourceState('controller', 'left')
  const rightController = useXRInputSourceState('controller', 'right')

  // Pointer event handlers
  const handlePointerEnter = useCallback(() => {
    setIsPointerOnTarget(true)
  }, [])

  const handlePointerLeave = useCallback(() => {
    setIsPointerOnTarget(false)
  }, [])

  // Helper function to check button state on a controller
  const checkButton = (
    gamepad: any,
    buttonName: string,
    buttonState: { [key: string]: boolean },
    callback?: () => void
  ) => {
    if (!callback) return

    const pressed = gamepad[`${buttonName}-button`]?.state === 'pressed'
    if (pressed && !buttonState[buttonName]) {
      // Button just pressed (edge-triggered)
      callback()
    }
    buttonState[buttonName] = pressed
  }

  // Helper function to check thumbstick direction on a controller
  // NOTE: We need inputSource.gamepad (standard Gamepad API with axes array)
  // not the custom gamepad property (which has button states like 'a-button')
  const checkThumbstick = (
    inputSource: XRInputSource | undefined,
    thumbstickStates: ThumbstickStates,
    callbacks: {
      up?: () => void
      down?: () => void
      left?: () => void
      right?: () => void
    }
  ) => {
    const gamepad = inputSource?.gamepad
    if (!gamepad?.axes) {
      debug('[checkThumbstick] No gamepad or axes available')
      return
    }

    const xAxis = gamepad.axes[2] || 0  // Thumbstick X axis
    const yAxis = gamepad.axes[3] || 0  // Thumbstick Y axis
    debug(`[checkThumbstick] Reading axes: x=${xAxis}, y=${yAxis}, threshold=${THUMBSTICK_THRESHOLD}`)

    // Up (Y axis negative)
    if (callbacks.up) {
      const up = yAxis < -THUMBSTICK_THRESHOLD
      debug(`[checkThumbstick] UP check: yAxis=${yAxis} < -${THUMBSTICK_THRESHOLD}? ${up}, wasUp=${thumbstickStates.up}`)
      if (up && !thumbstickStates.up) {
        debug('[checkThumbstick] FIRING onThumbstickUp callback!')
        callbacks.up()
      }
      thumbstickStates.up = up
    }

    // Down (Y axis positive)
    if (callbacks.down) {
      const down = yAxis > THUMBSTICK_THRESHOLD
      if (down && !thumbstickStates.down) {
        callbacks.down()
      }
      thumbstickStates.down = down
    }

    // Left (X axis negative)
    if (callbacks.left) {
      const left = xAxis < -THUMBSTICK_THRESHOLD
      if (left && !thumbstickStates.left) {
        callbacks.left()
      }
      thumbstickStates.left = left
    }

    // Right (X axis positive)
    if (callbacks.right) {
      const right = xAxis > THUMBSTICK_THRESHOLD
      if (right && !thumbstickStates.right) {
        callbacks.right()
      }
      thumbstickStates.right = right
    }
  }

  // Poll for button presses each frame
  useFrame(() => {
    debug('[useXRButtons useFrame] Frame tick, requirePointerOn:', requirePointerOn, 'isPointerOnTarget:', isPointerOnTarget)

    // Check if we should gate on pointer state
    if (requirePointerOn && !isPointerOnTarget) {
      debug('[useXRButtons useFrame] Skipping due to pointer requirement')
      return
    }

    // Check left controller
    if (leftController?.gamepad) {
      const gamepad = leftController.gamepad

      // Check buttons (all buttons work from either controller)
      checkButton(gamepad, 'a', leftButtonStates.current, onAPress)
      checkButton(gamepad, 'b', leftButtonStates.current, onBPress)
      checkButton(gamepad, 'x', leftButtonStates.current, onXPress)
      checkButton(gamepad, 'y', leftButtonStates.current, onYPress)

      // Check thumbstick - pass inputSource for axes access
      debug('[useXRButtons useFrame] Checking left controller thumbstick')
      checkThumbstick(leftController.inputSource, leftThumbstickStates.current, {
        up: onThumbstickUp,
        down: onThumbstickDown,
        left: onThumbstickLeft,
        right: onThumbstickRight
      })
    }

    // Check right controller
    if (rightController?.gamepad) {
      const gamepad = rightController.gamepad

      // Check buttons (all buttons work from either controller)
      checkButton(gamepad, 'a', rightButtonStates.current, onAPress)
      checkButton(gamepad, 'b', rightButtonStates.current, onBPress)
      checkButton(gamepad, 'x', rightButtonStates.current, onXPress)
      checkButton(gamepad, 'y', rightButtonStates.current, onYPress)

      // Check thumbstick - pass inputSource for axes access
      debug('[useXRButtons useFrame] Checking right controller thumbstick')
      checkThumbstick(rightController.inputSource, rightThumbstickStates.current, {
        up: onThumbstickUp,
        down: onThumbstickDown,
        left: onThumbstickLeft,
        right: onThumbstickRight
      })
    } else {
      debug('[useXRButtons useFrame] No right controller gamepad')
    }
  })

  return {
    targetRef,
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    isPointerOnTarget
  }
}
