import { BackSide } from 'three'

/**
 * @group Types
 */
export interface SkyboxProps {
  color?: string
}

/**
 * A skybox for VR environments using a box geometry (fewer triangles than sphere).
 *
 * @group Components
 */
export function Skybox(props: SkyboxProps) {
  const { color = '#000000' } = props
  // Black background box
  return (
    <mesh scale={[-1, 1, 1]} >
      <boxGeometry args={[1000, 1000, 1000]} />
      <meshBasicMaterial color={color} side={BackSide} />
    </mesh>
  )
}
