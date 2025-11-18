import { XRLayer } from '@react-three/xr'

/**
 * Props for the GridFloor component
 * @group Types
 */
export interface GridFloorProps {
  /** Size of the grid in meters (width and height). @default 20 */
  size?: number

  /** Color of the grid lines. @default '#00ff00' (neon green) */
  color?: string
}

/**
 * A floor grid component optimized for VR rendering using XRLayer.
 *
 * Renders a square grid at ground level (y=0) wrapped in an XRLayer quad
 * for high-quality rendering in VR headsets. The grid uses Three.js GridHelper
 * rendered to a high-resolution texture.
 *
 * @group Components
 *
 * @example Basic usage
 * ```tsx
 * import { GridFloor } from 'r3f-xr-widgets'
 * import { IfInSessionMode } from '@react-three/xr'
 *
 * <IfInSessionMode allow="immersive-vr">
 *   <GridFloor />
 * </IfInSessionMode>
 * ```
 *
 * @example Custom size and color
 * ```tsx
 * <GridFloor size={30} color="#ff0000" />
 * ```
 */
export function GridFloor(props: GridFloorProps) {
  const { size = 20, color = '#00ff00' } = props
  const divisions = size // One division per meter for clear grid

  return (
    <XRLayer
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      shape="quad"
      scale={[size, size, 1]}
      pixelWidth={2048}
      pixelHeight={2048}
    >
      <gridHelper
        args={[size, divisions, color, color]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </XRLayer>
  )
}
