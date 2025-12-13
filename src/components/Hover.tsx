import { useHover } from '@react-three/xr'
import { ReactNode, RefObject, useRef, useState } from 'react'
import { Group, Object3D } from 'three'
import { vibrateOnEvent, PulseConfig } from '../utils/vibrateOnEvent'

/**
 * Props for the Hover component
 * @group Types
 */
export interface HoverProps {
  /**
   * Render function that receives the current hover state
   * @param hovered - Whether the element is currently being hovered
   */
  children?: (hovered: boolean) => ReactNode

  /**
   * Optional ref to a specific Object3D to use as the hover target.
   * If not provided, the component creates its own group as the hover target.
   */
  hoverTargetRef?: RefObject<Object3D | null>

  /**
   * Optional haptic feedback configuration for XR controllers.
   * When provided, triggers vibration when hovering starts.
   * @see {@link PulseConfig}
   */
  pulse?: PulseConfig
}

/**
 * XR hover interaction component with optional haptic feedback
 *
 * Wraps content in a group and provides hover state through a render prop pattern.
 * Automatically triggers haptic feedback on XR controllers when hovering begins.
 *
 * @group Components
 *
 * @example
 * ```tsx
 * <Hover pulse={{ duration: 50, intensity: 0.5 }}>
 *   {(hovered) => (
 *     <mesh>
 *       <boxGeometry />
 *       <meshStandardMaterial color={hovered ? 'hotpink' : 'white'} />
 *     </mesh>
 *   )}
 * </Hover>
 * ```
 *
 * @example Using with custom hover target
 * ```tsx
 * const targetRef = useRef<Object3D>(null)
 *
 * <group>
 *   <mesh ref={targetRef}>
 *     <boxGeometry />
 *     <meshStandardMaterial />
 *   </mesh>
 *   <Hover hoverTargetRef={targetRef}>
 *     {(hovered) => (
 *       <Text>{hovered ? 'Hovered!' : 'Not hovered'}</Text>
 *     )}
 *   </Hover>
 * </group>
 * ```
 */
export function Hover(props: HoverProps) {
  const { children, hoverTargetRef, pulse } = props
  const ref = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  useHover(hoverTargetRef ?? ref, (hoverd, e) => {
    setHovered(hoverd)
    if (hoverd) {
      vibrateOnEvent(e, pulse)
    }
  })

  return <group ref={ref}>{children?.(hovered)}</group>
}
