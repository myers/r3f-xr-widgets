import { Container, type VanillaContainer } from "@react-three/uikit"
import { Pause, Play, FastForward, Rewind } from "@react-three/uikit-lucide"
import { useRef, useMemo } from "react"
import { useSpring } from "@react-spring/three"
import { signal } from "@preact/signals-core"
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:icons:flash')

const ICONS: Record<string, typeof Pause> = {
  pause: Pause,
  play: Play,
  fast_forward: FastForward,
  rewind: Rewind,
} as const

/**
 * Icon type for flash animations
 * @group Types
 */
export type IconType = keyof typeof ICONS

/**
 * @group Types
 */
export interface IconFlashProps {
  disabled?: boolean
  name?: IconType
  /** Name for the Three.js object for scene queries */
  object3DName?: string
}

/**
 * Flash animation component for displaying playback action icons
 * @group Components
 */
export const IconFlash = (props: IconFlashProps) => {
  const { disabled = false, name = "play", object3DName } = props
  const rootRef = useRef<VanillaContainer>(null)
  const initalScale = 1
  const iconOpacity = useMemo(() => signal(1), [])

  useSpring({
    pause: disabled,
    from: { opacity: 0.9, scale: initalScale },
    to: { opacity: 0, scale: initalScale * 2 },
    config: (key: string) => {
      if (key === "opacity") {
        return {
          tension: 500,
          friction: 150,
        }
      } else {
        return {
          tension: 120,
          friction: 10,
        }
      }
    },
    onChange: ({ value: { scale, opacity } }: { value: { scale: number; opacity: number } }) => {
      if (!rootRef.current) return

      iconOpacity.value = opacity
      rootRef.current.setProperties({
        transformScale: scale,
      })
    },
  })

  debug("iconOpacity1", iconOpacity.value)
  const Icon = ICONS[name]
  return (
    <Container
      ref={rootRef}
      object3DName={object3DName}
      borderRadius={50}
      backgroundColor="black"
      padding={10}
      justifyContent="center"
      alignItems="center"
      transformScale={initalScale}
      opacity={iconOpacity}
    >
      <Icon color="white" />
    </Container>
  )
}
