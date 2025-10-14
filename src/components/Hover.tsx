import { useHover } from '@react-three/xr'
import { ReactNode, RefObject, useRef, useState } from 'react'
import { Group, Object3D } from 'three'
import { vibrateOnEvent, PulseConfig } from '../utils/vibrateOnEvent'

interface HoverProps {
  children?: (hovered: boolean) => ReactNode
  hoverTargetRef?: RefObject<Object3D | null>
  pulse?: PulseConfig
}

export function Hover({ children, hoverTargetRef, pulse }: HoverProps) {
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