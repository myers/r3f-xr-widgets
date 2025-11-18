import { XRStore } from '@react-three/xr'
import { Scene, Vector3, Quaternion, Matrix4, Box3, Object3D } from 'three'
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:test:controller')

export interface PointOptions {
  /** Name of the target object (set via the 'name' prop in Three.js/R3F) */
  name: string
  /** Which controller to use - defaults to 'right' */
  hand?: 'left' | 'right'
}

/**
 * Find an object by name in the scene.
 * Logs all available named objects if the target is not found.
 *
 * @param scene - The Three.js scene to search in
 * @param name - Name of the object to find
 * @returns The object if found, null otherwise
 */
export function findObjectInScene(scene: Scene, name: string): Object3D | null {
  const target = scene.getObjectByName(name)

  if (!target) {
    // Debug: log all named objects in scene
    const namedObjects: string[] = []
    scene.traverse((obj) => {
      if (obj.name && obj.name !== '') {
        namedObjects.push(obj.name)
      }
    })
    debug(`findObjectInScene: Target '${name}' not found. Available named objects:`, namedObjects)
  }

  return target || null
}

/**
 * Helper class for controlling XR emulated controllers in tests.
 *
 * Usage:
 * ```ts
 * const helper = new ControllerHelper(store, scene)
 * await helper.point({ name: 'button-1' })
 * await helper.point({ name: 'button-5', hand: 'left' })
 * ```
 */
export class ControllerHelper {
  private store: XRStore
  private scene: Scene

  constructor(store: XRStore, scene: Scene) {
    this.store = store
    this.scene = scene
  }

  /**
   * Async factory method that creates a ControllerHelper and waits for controller tracking up front.
   * This ensures the helper is ready to use immediately without waiting on each button press.
   *
   * @param store - The XRStore instance
   * @param scene - The Three.js scene
   * @param hand - Which controller to wait for - defaults to 'right'
   * @param timeout - Maximum wait time in milliseconds - defaults to 3000
   * @returns Promise that resolves to a ready-to-use ControllerHelper instance
   *
   * @example
   * ```ts
   * const helper = await ControllerHelper.create(store, scene, 'right')
   * await helper.pressButton('a-button')  // No waiting needed, controller already tracked
   * ```
   */
  static async create(
    store: XRStore,
    scene: Scene,
    hand: 'left' | 'right' = 'right',
    timeout = 3000
  ): Promise<ControllerHelper> {
    const helper = new ControllerHelper(store, scene)
    await helper.waitForControllerTracking(hand, timeout)
    return helper
  }

  /**
   * Point a controller at a named object in the scene by rotating it.
   * The controller's position is not changed, only its orientation.
   *
   * @param optionsOrTarget - Configuration for pointing the controller, or a direct Object3D reference
   * @returns Promise that resolves after the controller has been rotated and a frame has been processed
   */
  async point(optionsOrTarget: PointOptions | Object3D, hand: 'left' | 'right' = 'right'): Promise<void> {
    let target: Object3D
    let controllerHand: 'left' | 'right'

    // Handle both Object3D and PointOptions
    if (optionsOrTarget instanceof Object3D) {
      target = optionsOrTarget
      controllerHand = hand
    } else {
      const { name, hand: optHand = 'right' } = optionsOrTarget
      controllerHand = optHand

      // Find target in scene
      const foundTarget = findObjectInScene(this.scene, name)
      if (!foundTarget) {
        throw new Error(`Target object with name '${name}' not found in scene`)
      }
      target = foundTarget
    }

    // Get emulator
    const emulator = this.store.getState().emulator
    if (!emulator) {
      throw new Error('Emulator not available. Make sure XRStore was created with emulate option.')
    }

    // Get controller directly (no DevUI dependency)
    const controller = emulator.controllers[controllerHand]
    if (!controller) {
      throw new Error(`Controller '${controllerHand}' not found on emulator`)
    }

    // Get target's bounding box center for more accurate pointing
    const targetWorldPos = new Vector3()

    // Calculate the center of the object's bounding box
    const box = new Box3().setFromObject(target)
    box.getCenter(targetWorldPos)

    // Get controller's current position (we won't change it)
    const controllerPos = new Vector3(controller.position.x, controller.position.y, controller.position.z)

    // Calculate the quaternion needed to point from controller position to target position
    const lookAtMatrix = new Matrix4()
    lookAtMatrix.lookAt(controllerPos, targetWorldPos, new Vector3(0, 1, 0))
    const targetQuaternion = new Quaternion()
    targetQuaternion.setFromRotationMatrix(lookAtMatrix)

    // Update the controller's quaternion directly
    controller.quaternion.x = targetQuaternion.x
    controller.quaternion.y = targetQuaternion.y
    controller.quaternion.z = targetQuaternion.z
    controller.quaternion.w = targetQuaternion.w

    // Wait for a frame to ensure the XR system processes the change
    await this.waitFrames(1)
  }

  /**
   * Press a button on the controller.
   * Simulates pressing and releasing a button (e.g., trigger, a-button, etc.)
   *
   * @param button - Name of the button to press ('trigger', 'a-button', 'b-button', etc.)
   * @param hand - Which controller to use - defaults to 'right'
   * @param holdFrames - How many XR frames to hold the button - defaults to 1
   * @returns Promise that resolves after the button has been pressed and released
   */
  async pressButton(button: string, hand: 'left' | 'right' = 'right', holdFrames = 1): Promise<void> {
    const emulator = this.store.getState().emulator
    if (!emulator) {
      throw new Error('Emulator not available. Make sure XRStore was created with emulate option.')
    }

    const controller = emulator.controllers[hand]
    if (!controller) {
      throw new Error(`Controller '${hand}' not found on emulator`)
    }

    // Press the button
    controller.updateButtonValue(button, 1)
    await this.waitFrames(holdFrames)

    // Release the button
    controller.updateButtonValue(button, 0)
  }

  /**
   * Move the thumbstick to a specific position and hold for specified duration.
   * Thumbstick axes: index 2 = X axis, index 3 = Y axis
   * Range: -1 to 1 for both axes
   *
   * @param hand - Which controller ('left' or 'right')
   * @param x - X axis value (-1 to 1, left to right)
   * @param y - Y axis value (-1 to 1, down to up, note: up is negative)
   * @param holdMs - How long to hold the position in milliseconds
   */
  async moveThumbstick(hand: 'left' | 'right' = 'right', x: number, y: number, holdMs = 100): Promise<void> {
    debug(`[ControllerHelper] moveThumbstick START: hand=${hand}, x=${x}, y=${y}, holdMs=${holdMs}`)

    const emulator = this.store.getState().emulator
    if (!emulator) {
      throw new Error('Emulator not available. Make sure XRStore was created with emulate option.')
    }

    const controller = emulator.controllers[hand]
    if (!controller) {
      throw new Error(`Controller '${hand}' not found on emulator`)
    }

    // Set thumbstick using the correct string ID
    // updateAxes signature: updateAxes(id: string, x: number, y: number)
    controller.updateAxes('thumbstick', x, y)
    debug(`[ControllerHelper] updateAxes called, axes set to [${x}, ${y}]`)

    // Hold the position
    await new Promise(resolve => setTimeout(resolve, holdMs))
    debug(`[ControllerHelper] After ${holdMs}ms wait`)

    await this.waitFrames(1)
    debug(`[ControllerHelper] After waitFrames(1), resetting to center`)

    // Return to center
    controller.updateAxes('thumbstick', 0, 0)
    debug(`[ControllerHelper] Thumbstick reset to center`)

    await this.waitFrames(1)
    debug(`[ControllerHelper] moveThumbstick COMPLETE`)
  }

  /**
   * Convenience method that points the controller at a target and clicks it.
   * Combines point() and pressButton('trigger').
   *
   * @param options - Configuration for pointing and clicking
   * @returns Promise that resolves after pointing and clicking
   */
  async clickAt(options: PointOptions & { holdFrames?: number }): Promise<void> {
    const { holdFrames = 1, ...pointOptions } = options
    const hand = pointOptions.hand || 'right'

    // Point at the target (already waits for frames internally)
    await this.point(pointOptions)

    // Click the trigger (already waits for frames internally)
    await this.pressButton('trigger', hand, holdFrames)

    // Wait for click event to be processed by React components
    await this.waitFrames(1)
  }

  /**
   * Reset controller to its default position
   */
  async reset(hand: 'left' | 'right' = 'right'): Promise<void> {
    const emulator = this.store.getState().emulator
    if (!emulator) {
      throw new Error('Emulator not available')
    }

    // Get controller directly (no DevUI dependency)
    const controller = emulator.controllers[hand]
    if (!controller) {
      throw new Error(`Controller '${hand}' not found on emulator`)
    }

    // Default positions from immersive-web-emulation-runtime
    const defaultPos = hand === 'left'
      ? new Vector3(-0.25, 1.5, -0.4)
      : new Vector3(0.25, 1.5, -0.4)
    const defaultQuat = new Quaternion(0, 0, 0, 1)

    // Update controller directly
    controller.position.x = defaultPos.x
    controller.position.y = defaultPos.y
    controller.position.z = defaultPos.z
    controller.quaternion.x = defaultQuat.x
    controller.quaternion.y = defaultQuat.y
    controller.quaternion.z = defaultQuat.z
    controller.quaternion.w = defaultQuat.w

    await this.waitFrames(1)
  }

  /**
   * Get current controller position as a Three.js Vector3
   */
  getControllerPosition(hand: 'left' | 'right' = 'right'): Vector3 | null {
    const emulator = this.store.getState().emulator
    if (!emulator) return null

    const controller = emulator.controllers[hand]
    if (!controller) return null

    // Convert from IWER Vector3 to Three.js Vector3
    return new Vector3(controller.position.x, controller.position.y, controller.position.z)
  }

  /**
   * Wait for controller to be tracked by the XR system using Zustand subscription.
   * Uses event-driven state watching instead of polling for deterministic behavior.
   */
  async waitForControllerTracking(hand: 'left' | 'right' = 'right', timeout = 3000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsubscribe()
        reject(new Error(`Timeout waiting for ${hand} controller to be tracked`))
      }, timeout)

      // Use Zustand subscribe - reacts immediately to state changes
      const unsubscribe = this.store.subscribe((state, prevState) => {
        // Optimization: only check if inputSourceStates array reference changed
        if (state.inputSourceStates === prevState.inputSourceStates) return

        const tracked = state.inputSourceStates.find(
          (s) => s.type === 'controller' && s.inputSource.handedness === hand
        )

        if (tracked) {
          clearTimeout(timeoutId)
          unsubscribe()
          resolve()
        }
      })

      // Check immediately in case controller is already tracked (race condition avoidance)
      const currentState = this.store.getState()
      const alreadyTracked = currentState.inputSourceStates.find(
        (s) => s.type === 'controller' && s.inputSource.handedness === hand
      )

      if (alreadyTracked) {
        clearTimeout(timeoutId)
        unsubscribe()
        resolve()
      }
    })
  }

  /**
   * Wait for a specified number of XR frames to actually process
   */
  async waitFrames(count: number): Promise<void> {
    const session = this.store.getState().session


    if (!session) {
      throw new Error('XR session not available in store')
    }

    // Wait for actual XR frames using session.requestAnimationFrame
    for (let i = 0; i < count; i++) {
      await new Promise<void>(resolve => {
        session.requestAnimationFrame(() => {
          resolve()
        })
      })
    }
  }
}
