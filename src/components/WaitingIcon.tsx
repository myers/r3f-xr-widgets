import { Root, withOpacity } from "@react-three/uikit"
import { LoaderCircle } from "@react-three/uikit-lucide"
import { useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { signal } from "@preact/signals-core"

export const WaitingIcon = () => {
  const speed = 0.9
  const rotation = useMemo(() => signal(0), [])

  useFrame((_, delta) => {
    rotation.value = rotation.value - delta * speed * 360
  })

  return (
    <Root
      borderRadius={50}
      backgroundColor={withOpacity("black", 0.6)}
      padding={10}
      justifyContent="center"
      alignItems="center"
    >
      <LoaderCircle color="white" transformRotateZ={rotation} opacity={0.6} />
    </Root>
  )
}
