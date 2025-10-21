import { useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Default eye level height in meters (1.5m).
 * Used for positioning UI elements at a comfortable viewing height.
 *
 * @example
 * ```tsx
 * import { DEFAULT_EYE_LEVEL } from 'r3f-xr-widgets'
 *
 * <mesh position={[0, DEFAULT_EYE_LEVEL, -1]} />
 * ```
 */
export const DEFAULT_EYE_LEVEL = 1.5

/**
 * Props for the EyeLevelGroup component
 */
interface EyeLevelGroupProps {
  /** React children to position at eye level */
  children: ReactNode
  /** Fallback eye level height in meters when not in XR session */
  defaultEyeLevel: number
}

/**
 * Positions its children at the user's actual eye level in XR.
 *
 * In XR mode, captures the camera's Y position once when entering a session
 * to determine the user's actual eye level. Outside of XR, uses the provided
 * default eye level.
 *
 * This component is useful for ensuring UI elements and content are positioned
 * at a comfortable viewing height for each individual user, accounting for
 * differences in height and play space setup.
 *
 * @example
 * ```tsx
 * import { EyeLevelGroup, DEFAULT_EYE_LEVEL } from 'r3f-xr-widgets'
 *
 * <EyeLevelGroup defaultEyeLevel={DEFAULT_EYE_LEVEL}>
 *   <mesh position={[0, 0, -1]}>
 *     <boxGeometry />
 *     <meshStandardMaterial />
 *   </mesh>
 * </EyeLevelGroup>
 * ```
 */
export function EyeLevelGroup({ children, defaultEyeLevel }: EyeLevelGroupProps) {
  const session = useXR((state) => state.session)
  const { camera } = useThree()
  const [eyeLevel, setEyeLevel] = useState(defaultEyeLevel)
  const heightCapturedRef = useRef(false)

  // Capture camera height once when entering XR
  useEffect(() => {
    if (session) {
      heightCapturedRef.current = false
    } else {
      setEyeLevel(defaultEyeLevel)
    }
  }, [session, defaultEyeLevel])

  useFrame(() => {
    if (camera && session && !heightCapturedRef.current) {
      setEyeLevel(camera.position.y)
      heightCapturedRef.current = true
    }
  })

  return <group position-y={eyeLevel}>{children}</group>
}
