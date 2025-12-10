import { XRLayer } from '@react-three/xr'
import { useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'

/**
 * Props for the GridFloor component
 * @group Types
 */
export interface GridFloorProps {
  /** Size of the grid in meters (width and height). @default 20 */
  size?: number

  /** Color of the grid dots. @default '#aaaaaa' (light grey) */
  color?: string

  /** Color of the meter mark crosses. @default '#ffffff' (white) */
  crossColor?: string

  /** Background color of the grid floor. @default '#404040' (grey) */
  backgroundColor?: string

  /** Spacing between grid dots in meters. @default 0.1 */
  spacing?: number

  /** Render order for XRLayer compositing. Lower values render behind higher values. @default -1000 */
  renderOrder?: number
}

/**
 * Creates geometries for grid dots and cross rectangles at meter marks
 * Note: Uses XY plane (z=0) because XRLayer renders to a 2D texture
 */
function createGridGeometry(size: number, spacing: number): { dots: BufferGeometry; crossRects: BufferGeometry } {
  const halfSize = size / 2
  const dotPositions: number[] = []
  const crossRectPositions: number[] = []
  const crossRectIndices: number[] = []

  // Calculate number of steps based on spacing
  const steps = Math.floor(size / spacing)
  const actualSpacing = size / steps

  // Every 10th step (1m intervals) gets a cross
  const meterInterval = 10
  const crossArmLength = actualSpacing * 0.75 // length of each arm from center
  const crossThickness = actualSpacing * 0.2 // thickness

  let vertexIndex = 0

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const x = -halfSize + i * actualSpacing
      const y = -halfSize + j * actualSpacing
      const isOnMeterRow = i % meterInterval === 0
      const isOnMeterCol = j % meterInterval === 0
      const isMeterMark = isOnMeterRow && isOnMeterCol

      if (isMeterMark) {
        // Horizontal rectangle
        const hx1 = x - crossArmLength, hx2 = x + crossArmLength
        const hy1 = y - crossThickness / 2, hy2 = y + crossThickness / 2
        crossRectPositions.push(hx1, hy1, 0, hx2, hy1, 0, hx2, hy2, 0, hx1, hy2, 0)
        crossRectIndices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3)
        vertexIndex += 4

        // Vertical rectangle
        const vx1 = x - crossThickness / 2, vx2 = x + crossThickness / 2
        const vy1 = y - crossArmLength, vy2 = y + crossArmLength
        crossRectPositions.push(vx1, vy1, 0, vx2, vy1, 0, vx2, vy2, 0, vx1, vy2, 0)
        crossRectIndices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2, vertexIndex, vertexIndex + 2, vertexIndex + 3)
        vertexIndex += 4
      } else if (!isOnMeterRow && !isOnMeterCol) {
        // Regular dot only if not on a meter row or column
        dotPositions.push(x, y, 0)
      }
    }
  }

  const dotsGeom = new BufferGeometry()
  dotsGeom.setAttribute('position', new Float32BufferAttribute(dotPositions, 3))

  const crossRectsGeom = new BufferGeometry()
  crossRectsGeom.setAttribute('position', new Float32BufferAttribute(crossRectPositions, 3))
  crossRectsGeom.setIndex(crossRectIndices)

  return { dots: dotsGeom, crossRects: crossRectsGeom }
}

/**
 * A floor grid component optimized for VR rendering using XRLayer.
 *
 * Renders a grid at ground level (y=0) with dots at interior intersections
 * and crosses at the 4 outer corners for orientation. Uses an XRLayer quad
 * for high-quality rendering in VR headsets.
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
 * <GridFloor size={30} color="#00ff00" backgroundColor="#222222" spacing={1} />
 * ```
 */
export function GridFloor(props: GridFloorProps) {
  const {
    size = 20,
    color = '#d0d0d0',
    crossColor = '#e0e0e0',
    backgroundColor = '#a0a0a0',
    spacing = 0.1,
    renderOrder = -1000
  } = props

  const { dots, crossRects } = useMemo(() => createGridGeometry(size, spacing), [size, spacing])

  return (
    <XRLayer
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      shape="quad"
      scale={[size, size, 1]}
      pixelWidth={2048}
      pixelHeight={2048}
      renderOrder={renderOrder}
    >
      {/* Grey background plane */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial color={backgroundColor} />
      </mesh>

      {/* Regular dots */}
      <points geometry={dots}>
        <pointsMaterial color={color} size={4} sizeAttenuation={false} />
      </points>

      {/* Cross rectangles at meter marks */}
      <mesh geometry={crossRects}>
        <meshBasicMaterial color={crossColor} />
      </mesh>
    </XRLayer>
  )
}
