import { useFrame } from '@react-three/fiber'
import { forwardRef, ReactNode, useRef, useImperativeHandle } from 'react'
import { Euler, Group, Quaternion, Vector3 } from 'three'

// Helper objects for rotation calculations (reused to avoid allocations)
const eulerHelper = new Euler()
const quaternionHelper = new Quaternion()
const cameraPos = new Vector3()
const groupPos = new Vector3()
const zAxis = new Vector3(0, 0, 1)

// Minimum distance to prevent unstable rotation when camera is very close
const MIN_ROTATION_DISTANCE = 0.1
const directionHelper = new Vector3()

/**
 * Rotates a group to face a target position on the Y-axis only.
 * Skips rotation if camera is too close to prevent instability.
 */
function rotateGroupToFaceCamera(group: Group, cameraPosition: Vector3, targetPosition: Vector3) {
  directionHelper.subVectors(cameraPosition, targetPosition)

  // Skip rotation if camera is too close - prevents NaN/unstable values
  if (directionHelper.lengthSq() < MIN_ROTATION_DISTANCE * MIN_ROTATION_DISTANCE) {
    return
  }

  quaternionHelper.setFromUnitVectors(zAxis, directionHelper.normalize())
  eulerHelper.setFromQuaternion(quaternionHelper, 'YXZ')
  group.rotation.y = eulerHelper.y
}

/**
 * Gets the world position to track for rotation.
 * If the group has children, uses the first child's world position.
 * Otherwise uses the group's own world position.
 */
function getTrackingPosition(group: Group, target: Vector3): void {
  if (group.children.length > 0) {
    group.children[0].getWorldPosition(target)
  } else {
    group.getWorldPosition(target)
  }
}

/**
 * Props for the CylindricalBillboard component
 * @group Types
 */
export interface CylindricalBillboardProps {
  /** React children to render inside the billboard */
  children?: ReactNode
  /** Rotate to face camera once on mount. Defaults to true */
  initialRotation?: boolean
  /** Continuously rotate to face camera. Defaults to false */
  autoRotate?: boolean
  /** Rotate when child position changes (during drag). Defaults to true */
  rotateOnDrag?: boolean
}

/**
 * A wrapper component that rotates children to face the camera on the Y-axis only.
 *
 * Unlike a full Billboard which rotates on all axes, CylindricalBillboard only
 * rotates around the Y-axis (yaw), keeping children upright. This is ideal for
 * UI panels, windows, and signage that should face the user but maintain
 * vertical orientation.
 *
 * By default, rotates once on mount (`initialRotation=true`) and during drag
 * operations (`rotateOnDrag=true`). Once placed, the billboard stays in its
 * current orientation until moved again. Set `autoRotate=true` to continuously
 * face the camera.
 *
 * The billboard tracks the world position of its first child for rotation
 * calculations, so if children are moved (e.g., via drag handles), the
 * billboard will correctly rotate to face the camera from the new position.
 *
 * @group Components
 *
 * @example
 * ```tsx
 * import { CylindricalBillboard } from 'r3f-xr-widgets'
 *
 * function Scene() {
 *   return (
 *     <CylindricalBillboard>
 *       <mesh>
 *         <planeGeometry args={[1, 1]} />
 *         <meshBasicMaterial color="blue" />
 *       </mesh>
 *     </CylindricalBillboard>
 *   )
 * }
 * ```
 */
export const CylindricalBillboard = forwardRef<Group, CylindricalBillboardProps>(
  function CylindricalBillboard(props, ref) {
    const { children, initialRotation = true, autoRotate = false, rotateOnDrag = true } = props
    const groupRef = useRef<Group>(null)
    const hasInitiallyRotated = useRef(false)
    const lastChildPos = useRef(new Vector3())

    useImperativeHandle(ref, () => groupRef.current as Group, [])

    useFrame((state) => {
      if (groupRef.current == null) {
        return
      }

      // Handle initial rotation (one-time)
      if (initialRotation && !hasInitiallyRotated.current) {
        state.camera.getWorldPosition(cameraPos)
        getTrackingPosition(groupRef.current, groupPos)
        rotateGroupToFaceCamera(groupRef.current, cameraPos, groupPos)
        // Store initial position for drag detection
        lastChildPos.current.copy(groupPos)
        hasInitiallyRotated.current = true
        return
      }

      // Get current child position
      getTrackingPosition(groupRef.current, groupPos)

      // Check if child position changed (indicates dragging)
      const positionChanged = !groupPos.equals(lastChildPos.current)
      lastChildPos.current.copy(groupPos)

      // Rotate if autoRotate is on, or if position changed and rotateOnDrag is on
      if (autoRotate || (rotateOnDrag && positionChanged)) {
        state.camera.getWorldPosition(cameraPos)
        rotateGroupToFaceCamera(groupRef.current, cameraPos, groupPos)
      }
    })

    return <group ref={groupRef}>{children}</group>
  }
)
