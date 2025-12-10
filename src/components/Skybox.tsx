import { useCallback } from 'react'
import type { Mesh } from 'three'
import { BackSide } from 'three'

/**
 * @group Types
 */
export interface SkyboxProps {
  color?: string
}

// No-op raycast function to disable ray intersection
const noopRaycast = () => {}

/**
 * A simple skybox for VR environments using a box geometry with solid color
 *
 * For image-based skyboxes, use CubemapSkybox instead which supports
 * WebXR's native XRCubeLayer for optimal VR rendering.
 *
 * @group Components
 *
 * @see {@link CubemapSkybox} for image-based skyboxes with XRCubeLayer support
 */
export function Skybox(props: SkyboxProps) {
  const { color = '#000000' } = props

  // Disable pointer events on the skybox mesh to prevent it from
  // interfering with grab pointer and ray pointer.
  const meshRef = useCallback((mesh: Mesh | null) => {
    if (mesh) {
      // Disable pointer events using @pmndrs/pointer-events standard property
      mesh.pointerEvents = 'none'
      // Disable ray intersection
      mesh.raycast = noopRaycast
    }
  }, [])

  // Black background box
  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]} >
      <boxGeometry args={[1000, 1000, 1000]} />
      <meshBasicMaterial color={color} side={BackSide} />
    </mesh>
  )
}
