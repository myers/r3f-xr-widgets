import { XRLayer } from '@react-three/xr'
import { useCallback, useMemo } from 'react'
import type { Mesh } from 'three'

/**
 * Props for the XRLayerSkybox component
 * @group Types
 */
export interface XRLayerSkyboxProps {
  /** Color of the skybox @default '#000000' */
  color?: string
  /** Render order for layer compositing (lower = behind) @default -2000 */
  renderOrder?: number
}

/**
 * Creates a 1x1 canvas with a solid color.
 */
function createColorCanvas(color: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  return canvas
}

// No-op raycast function to disable ray intersection
const noopRaycast = () => {}

/**
 * A skybox component that uses XRLayer with equirect shape to create
 * a spherical background that surrounds the viewer.
 *
 * Uses WebXR's native equirect layer when available, with automatic
 * fallback rendering for non-XR contexts.
 *
 * @group Components
 *
 * @example
 * ```tsx
 * // Black skybox (default)
 * <XRLayerSkybox />
 *
 * // Custom color skybox
 * <XRLayerSkybox color="#1a1a2e" />
 * ```
 *
 * @see {@link Skybox} for a simple mesh-based skybox without XRLayer
 */
export function XRLayerSkybox({ color = '#000000', renderOrder = -2000 }: XRLayerSkyboxProps) {
  const colorCanvas = useMemo(() => createColorCanvas(color), [color])

  // Ref callback to disable pointer events on the XRLayer mesh.
  // This prevents the skybox from interfering with grab pointer and ray pointer.
  // Requires patched @react-three/xr with fixed useImperativeHandle deps.
  const meshRef = useCallback((mesh: Mesh | null) => {
    if (mesh) {
      console.log('[XRLayerSkybox] Setting pointerEvents=none on mesh:', mesh.type, mesh.geometry?.type)
      // Disable pointer events using @pmndrs/pointer-events standard property
      // This is checked in intersectPointerEventTargets before any intersection calculations
      mesh.pointerEvents = 'none'
      // Disable ray intersection
      mesh.raycast = noopRaycast
    }
  }, [])

  return (
    <XRLayer
      ref={meshRef}
      shape="equirect"
      src={colorCanvas}
      centralHorizontalAngle={Math.PI * 2}
      upperVerticalAngle={Math.PI / 2}
      lowerVerticalAngle={-Math.PI / 2}
      scale={100}
      renderOrder={renderOrder}
      blendTextureSourceAlpha={false}
    />
  )
}
