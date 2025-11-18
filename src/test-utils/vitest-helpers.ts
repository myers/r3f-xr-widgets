import { expect } from 'vitest'
import type { XRStore } from '@react-three/xr'
import type { Scene } from 'three'
import { ControllerHelper } from './ControllerHelper'

export interface EnterVRSessionOptions {
  container: HTMLElement
  timeout?: number
}

/**
 * Helper function to enter VR session via Enter VR button for Vitest browser tests.
 * Gets store and scene from canvas element, enters VR, creates ControllerHelper.
 *
 * @param options - Configuration for entering VR session
 * @returns Promise with scene and controllers (ControllerHelper)
 */
export async function enterVRSession(
  options: EnterVRSessionOptions
): Promise<{ scene: Scene; controllers: ControllerHelper }> {
  const { container, timeout = 5000 } = options

  // Find the actual <canvas> element within the container
  const actualCanvas = container.querySelector('canvas')
  if (!actualCanvas) {
    throw new Error('enterVRSession: <canvas> element not found in container')
  }

  // Wait for store and scene to be available on canvas element
  // (SceneCapture sets these in useEffect which runs asynchronously)
  await expect.poll(() => (actualCanvas as any).__xrStore, { timeout }).toBeDefined()
  await expect.poll(() => (actualCanvas as any).__scene, { timeout }).toBeDefined()

  // Get store and scene from canvas element
  const store = (actualCanvas as any).__xrStore as XRStore
  const scene = (actualCanvas as any).__scene as Scene

  // Find and wait for Enter VR button to be enabled
  const enterVRButton = container.querySelector('button')
  if (!enterVRButton) {
    throw new Error('enterVRSession: Enter VR button not found')
  }

  await expect.poll(() => !(enterVRButton as HTMLButtonElement).disabled, { timeout }).toBe(true)

  // Click the button
  enterVRButton.click()

  // Wait for session to be ready
  await expect.poll(() => store.getState().session, { timeout }).toBeDefined()

  // Create ControllerHelper (waits for controller tracking internally)
  const controllers = await ControllerHelper.create(store, scene, 'right')

  // Wait for R3F render loop to start (useFrame needs to be running)
  await controllers.waitFrames(3)

  return { scene, controllers }
}

/**
 * Helper function to clean up XR session after tests.
 * Use this in afterEach() to ensure proper cleanup between tests.
 *
 * @example
 * ```typescript
 * afterEach(async () => {
 *   await cleanupXRSession()
 * })
 * ```
 */
export async function cleanupXRSession(): Promise<void> {
  // End XR session if one exists
  const canvas = document.querySelector('canvas')
  const store = (canvas as any)?.__xrStore
  if (store?.getState().session) {
    await store.getState().session.end()
  }
}
