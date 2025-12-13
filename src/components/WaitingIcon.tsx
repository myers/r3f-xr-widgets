import { Container } from "@react-three/uikit"
import { LoaderCircle } from "@react-three/uikit-lucide"
import { useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { signal } from "@preact/signals-core"

/**
 * @group Types
 */
export interface WaitingIconProps {
  /** Name for the Three.js object for scene queries */
  object3DName?: string
}

/**
 * Animated loading/buffering indicator icon with spinning animation
 * @group Components
 */
export const WaitingIcon = (props: WaitingIconProps) => {
  const { object3DName } = props
  const speed = 0.9
  const rotation = useMemo(() => signal(0), [])

  useFrame((_, delta) => {
    rotation.value = rotation.value - delta * speed * 360
  })

  return (
    <Container
      object3DName={object3DName}
      borderRadius={50}
      backgroundColor="#000000"
      opacity={0.6}
      padding={10}
      justifyContent="center"
      alignItems="center"
    >
      <LoaderCircle color="white" transformRotateZ={rotation} opacity={0.6} />
    </Container>
  )
}
