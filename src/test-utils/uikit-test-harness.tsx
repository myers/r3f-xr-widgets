import ReactThreeTestRenderer from '@react-three/test-renderer'

// Configure React act() environment for @react-three/test-renderer
// This tells React that we're in a testing environment and act() is available
// Matches what react-three-fiber does in their test setup
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Type for the test renderer instance
type TestRenderer = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>

/**
 * Render a UIKit component tree for testing without XR or browser complexity.
 * Uses @react-three/test-renderer for headless rendering.
 *
 * @param element - React element to render
 * @returns Test renderer instance with scene access
 *
 * @example
 * ```typescript
 * const renderer = await renderUIKit(
 *   <Container onClick={handleClick}>
 *     <Text>Click me</Text>
 *   </Container>
 * )
 *
 * // Find elements using built-in methods
 * const button = renderer.scene.findByProps({ name: 'my-button' })
 * await renderer.fireEvent(button, 'click')
 * ```
 */
export async function renderUIKit(element: React.ReactElement) {
  return await ReactThreeTestRenderer.create(element)
}

/**
 * Type for the test renderer instance returned by renderUIKit
 */
export type UIKitTestRenderer = TestRenderer
