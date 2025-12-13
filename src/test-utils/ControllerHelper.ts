import { XRStore } from '@react-three/xr'
import { Scene, Vector3, Quaternion, Matrix4, Box3, Object3D, Mesh } from 'three'

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
    console.debug(`findObjectInScene: Target '${name}' not found. Available named objects:`, namedObjects)
  }

  return target || null
}

/**
 * Helper to check if an object tree has valid geometry for Box3 calculations.
 * UIKit containers have geometry, but their children (icons) often have malformed geometry
 * with empty or missing attributes.
 */
function hasValidGeometry(obj: Object3D): boolean {
  // Check if this object is a Mesh with invalid geometry
  if (obj.type === 'Mesh') {
    const mesh = obj as Mesh
    if (mesh.geometry && !mesh.geometry.attributes?.position) {
      return false
    }
  }

  // Recursively check children
  for (const child of obj.children) {
    if (!hasValidGeometry(child)) {
      return false
    }
  }

  return true
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
   * Get a controller from the emulator, throwing if not available.
   */
  private getController(hand: 'left' | 'right') {
    const emulator = this.store.getState().emulator
    if (!emulator) {
      throw new Error('Emulator not available. Make sure XRStore was created with emulate option.')
    }
    const controller = emulator.controllers[hand]
    if (!controller) {
      throw new Error(`Controller '${hand}' not found on emulator`)
    }
    return controller
  }

  /**
   * Wait for pointer events to propagate through React after controller changes.
   */
  private async waitForPointerPropagation(): Promise<void> {
    await this.waitFrames(3)
    await new Promise(resolve => setTimeout(resolve, 50))
    await this.waitFrames(2)
  }

  /**
   * Calculate a quaternion that points from one position to another.
   */
  private calculateLookAtQuaternion(from: Vector3, to: Vector3): Quaternion {
    const lookAtMatrix = new Matrix4()
    lookAtMatrix.lookAt(from, to, new Vector3(0, 1, 0))
    const quaternion = new Quaternion()
    quaternion.setFromRotationMatrix(lookAtMatrix)
    return quaternion
  }

  /**
   * Apply a quaternion to a controller.
   */
  private applyQuaternionToController(controller: { quaternion: { x: number; y: number; z: number; w: number } }, quaternion: Quaternion): void {
    controller.quaternion.x = quaternion.x
    controller.quaternion.y = quaternion.y
    controller.quaternion.z = quaternion.z
    controller.quaternion.w = quaternion.w
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

    const controller = this.getController(controllerHand)

    // Get target's world position
    const targetWorldPos = new Vector3()

    // Try to use bounding box center for better accuracy, but fall back to world position.
    // We validate geometry before calling Box3.setFromObject() to avoid exceptions.
    if (hasValidGeometry(target)) {
      const box = new Box3().setFromObject(target)
      if (box.isEmpty()) {
        target.getWorldPosition(targetWorldPos)
      } else {
        box.getCenter(targetWorldPos)
      }
    } else {
      // Object or children have invalid geometry (common with UIKit icon components).
      target.getWorldPosition(targetWorldPos)
    }

    // Get controller's current position
    const controllerPos = new Vector3(controller.position.x, controller.position.y, controller.position.z)

    // Calculate and apply the quaternion
    const targetQuaternion = this.calculateLookAtQuaternion(controllerPos, targetWorldPos)
    this.applyQuaternionToController(controller, targetQuaternion)

    await this.waitForPointerPropagation()
  }

  /**
   * Point the controller at a specific world position.
   * Useful for testing pointer events by aiming at or away from targets.
   *
   * @param target - World position to point at
   * @param hand - Which controller ('left' or 'right')
   *
   * @example Point away from target at (0, 1.5, -3)
   * await controllers.pointAt(new Vector3(0, 0, 0), 'right')
   *
   * @example Point at target
   * await controllers.pointAt(new Vector3(0, 1.5, -3), 'right')
   */
  async pointAt(target: Vector3, hand: 'left' | 'right' = 'right'): Promise<void> {
    const controller = this.getController(hand)

    const controllerPos = new Vector3(
      controller.position.x,
      controller.position.y,
      controller.position.z
    )

    const targetQuaternion = this.calculateLookAtQuaternion(controllerPos, target)
    this.applyQuaternionToController(controller, targetQuaternion)

    await this.waitForPointerPropagation()
  }

  /**
   * Move controller to a new position and point it at a target.
   * Unlike pointAt(), this also moves the controller's position, which is
   * necessary for triggering pointer leave events when moving away from targets.
   *
   * @param position - New world position for the controller
   * @param lookAt - Position to point the controller at
   * @param hand - Which controller ('left' or 'right')
   */
  async moveToAndPointAt(position: Vector3, lookAt: Vector3, hand: 'left' | 'right' = 'right'): Promise<void> {
    const controller = this.getController(hand)

    // Move controller to new position
    controller.position.x = position.x
    controller.position.y = position.y
    controller.position.z = position.z

    const targetQuaternion = this.calculateLookAtQuaternion(position, lookAt)
    this.applyQuaternionToController(controller, targetQuaternion)

    await this.waitForPointerPropagation()
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
    const controller = this.getController(hand)

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
    const controller = this.getController(hand)

    // Set thumbstick using the correct string ID
    controller.updateAxes('thumbstick', x, y)

    // Hold the position
    await new Promise(resolve => setTimeout(resolve, holdMs))
    await this.waitFrames(1)

    // Return to center
    controller.updateAxes('thumbstick', 0, 0)
    await this.waitFrames(1)
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
    const controller = this.getController(hand)

    // Default positions from immersive-web-emulation-runtime
    const defaultPos = hand === 'left'
      ? new Vector3(-0.25, 1.5, -0.4)
      : new Vector3(0.25, 1.5, -0.4)
    const defaultQuat = new Quaternion(0, 0, 0, 1)

    // Update controller directly
    controller.position.x = defaultPos.x
    controller.position.y = defaultPos.y
    controller.position.z = defaultPos.z
    this.applyQuaternionToController(controller, defaultQuat)

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
