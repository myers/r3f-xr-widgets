import { expect } from 'vitest'
import { createXRStore, type XRStore } from '@react-three/xr'
import createDebug from 'debug'
import type { Scene } from 'three'
import { ControllerHelper } from './ControllerHelper'
import { LOCAL_XR_ASSET_PATH } from './xr-test-config'

const debug = createDebug('r3f-xr-widgets:test-utils:vitest-helpers')

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

  // Find Enter VR button
  const enterVRButton = container.querySelector('button')
  if (!enterVRButton) {
    throw new Error('enterVRSession: Enter VR button not found')
  }

  // Wait for button to be enabled (iwer initialization)
  debug('Waiting for Enter VR button to be enabled (iwer initialization)...')
  await expect.poll(() => !(enterVRButton as HTMLButtonElement).disabled, { timeout }).toBe(true)
  debug('Enter VR button enabled')

  // Click the button
  debug('Clicking Enter VR button...')
  enterVRButton.click()

  // Wait for session to be ready and button to be removed
  debug('Waiting for session to be ready and button to be removed...')
  await expect.poll(() => store.getState().session, { timeout }).toBeDefined()
  await expect.poll(() => container.querySelector('button'), { timeout }).toBeNull()
  debug('Session ready, button removed')

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

/**
 * Creates an XR store and waits for iwer to be ready.
 * Call this BEFORE render() to avoid act() warnings.
 *
 * This function polls navigator.xr.isSessionSupported() until it returns true,
 * which indicates that iwer (the XR emulator) has finished initializing.
 *
 * @example
 * ```typescript
 * let store: XRStore
 *
 * beforeEach(async () => {
 *   store = await createTestXRStore()
 * })
 *
 * it('my test', async () => {
 *   const { container } = render(
 *     <XRTestCanvas store={store}>
 *       <MyComponent />
 *     </XRTestCanvas>
 *   )
 * })
 * ```
 */
export async function createTestXRStore(): Promise<XRStore> {
  debug('Creating test XR store...')

  const store = createXRStore({
    baseAssetPath: LOCAL_XR_ASSET_PATH,
    emulate: {
      type: 'metaQuest3',
      inject: true,
      primaryInputMode: 'controller',
    },
    offerSession: false,
  })

  // Poll until iwer is ready (like useXRSessionModeSupportedPolling does)
  debug('Waiting for iwer to be ready...')
  while (true) {
    const supported = await navigator.xr?.isSessionSupported('immersive-vr')
    if (supported) break
    await new Promise(r => setTimeout(r, 50))
  }
  debug('iwer ready')

  return store
}
