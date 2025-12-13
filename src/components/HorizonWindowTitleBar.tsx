import { Container, Text } from '@react-three/uikit'
import { XIcon } from '@react-three/uikit-lucide'
import { montserrat } from '@pmndrs/msdfonts'

/**
 * Props for the HorizonWindowTitleBar component
 * @group Types
 */
export interface HorizonWindowTitleBarProps {
  title?: string
  onClose?: () => void
}

/**
 * Title bar component for HorizonWindow with optional title and close button
 * @group Components
 */
export function HorizonWindowTitleBar(props: HorizonWindowTitleBarProps) {
  const { title, onClose } = props
  return (
    <Container flexDirection="row" alignItems="center" gap={16} flexGrow={1} >
      {title && (
        <Text fontSize={24} color="white" fontFamily="montserrat" fontFamilies={{ montserrat }}>
          {title}
        </Text>
      )
      }
      <Container flexGrow={1} />
      {
        onClose && (
          <Container
            width={40}
            height={40}
            onClick={(e) => {
              e.stopPropagation?.()
              onClose()
            }}
            onPointerDown={(e) => {
              e.stopPropagation?.()
            }}
            cursor="pointer"
            alignItems="center"
            justifyContent="center"
          >
            <XIcon width={24} height={24} color="white" />
          </Container>
        )
      }
    </Container >
  )
}
