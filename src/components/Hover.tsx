import { useHover } from '@react-three/xr'
import { ReactNode, RefObject, useRef, useState } from 'react'
import { Group, Object3D } from 'three'
import { vibrateOnEvent } from '../utils/vibrateOnEvent'

interface HoverProps {
  children?: (hovered: boolean) => ReactNode
  hoverTargetRef?: RefObject<Object3D | null>
}

export function Hover({ children, hoverTargetRef }: HoverProps) {
  const ref = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  
  useHover(hoverTargetRef ?? ref, (hoverd, e) => {
    setHovered(hoverd)
    if (hoverd) {
      vibrateOnEvent(e)
    }
  })
  
  return <group ref={ref}>{children?.(hovered)}</group>
}