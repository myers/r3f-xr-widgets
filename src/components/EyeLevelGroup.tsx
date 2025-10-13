import { useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

// Default eye level for camera and panel positioning (in meters)
export const DEFAULT_EYE_LEVEL = 1.5

interface EyeLevelGroupProps {
  children: ReactNode
  defaultEyeLevel: number
}

/**
 * Positions its children at the user's eye level in XR.
 * Captures the camera height once when entering an XR session.
 * Falls back to defaultEyeLevel when not in a session.
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
