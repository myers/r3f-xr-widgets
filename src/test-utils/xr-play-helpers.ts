import { waitFor, expect } from 'storybook/test'
import type { XRStore } from '@react-three/xr'
import type { Scene } from 'three'
import { ControllerHelper } from './ControllerHelper'

export interface EnterVRSessionOptions {
  canvas: any
  userEvent: any
  canvasElement: HTMLElement
  timeout?: number
}

/**
 * Helper function to enter VR session via Enter VR button.
 * Gets store and scene from canvas element, enters VR, creates ControllerHelper.
 *
 * @param options - Configuration for entering VR session
 * @returns Promise with scene and controllers (ControllerHelper)
 */
export async function enterVRSession(
  options: EnterVRSessionOptions
): Promise<{ scene: Scene; controllers: ControllerHelper }> {
  const { canvas, userEvent, canvasElement, timeout = 5000 } = options

  // Find the actual <canvas> element within the story container
  // (canvasElement from Storybook is the root div, not the canvas)
  const actualCanvas = canvasElement.querySelector('canvas')
  if (!actualCanvas) {
    throw new Error('enterVRSession: <canvas> element not found in story')
  }

  // Wait for store and scene to be available on canvas element
  // (SceneCapture sets these in useEffect which runs asynchronously)
  await waitFor(() => {
    const store = (actualCanvas as any).__xrStore
    const scene = (actualCanvas as any).__scene
    expect(store, 'XRStore should be stored on canvas element').toBeDefined()
    expect(scene, 'Scene should be stored on canvas element').toBeDefined()
  }, { timeout })

  // Get store and scene from canvas element
  const store = (actualCanvas as any).__xrStore as XRStore
  const scene = (actualCanvas as any).__scene as Scene

  // Find and wait for Enter VR button to be enabled
  const enterVRButton = await canvas.findByRole('button', { name: /Enter VR/i })
  await waitFor(() => {
    expect((enterVRButton as HTMLButtonElement).disabled).toBe(false)
  }, { timeout })

  await userEvent.click(enterVRButton)

  // Wait for session to be ready
  await waitFor(() => {
    expect(store.getState().session).toBeDefined()
  }, { timeout })

  // Create ControllerHelper (waits for controller tracking internally)
  const controllers = await ControllerHelper.create(store, scene, 'right')

  return { scene, controllers }
}
