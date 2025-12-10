import { Container, Text } from '@react-three/uikit'
import { ArrowLeftIcon, XIcon } from '@react-three/uikit-lucide'
import { montserrat } from '@pmndrs/msdfonts'

export interface VideoPlayerTitleBarProps {
  title: string
  showBack: boolean
  onBack?: () => void
  onClose: () => void
}

export function VideoPlayerTitleBar({ title, showBack, onBack, onClose }: VideoPlayerTitleBarProps) {
  return (
    <Container flexDirection="row" alignItems="center" gap={16} flexGrow={1}>
      {/* Back Button */}
      {showBack && onBack && (
        <Container
          width={40}
          height={40}
          onClick={(e) => {
            e.stopPropagation?.()
            onBack()
          }}
          onPointerDown={(e) => {
            e.stopPropagation?.()
          }}
          cursor="pointer"
          alignItems="center"
          justifyContent="center"
        >
          <ArrowLeftIcon width={24} height={24} color="white" />
        </Container>
      )}

      {/* Title */}
      <Text fontFamily="montserrat" fontSize={24} color="white" flexGrow={1} fontFamilies={{ montserrat }}>
        {title}
      </Text>

      {/* Close Button */}
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
    </Container>
  )
}
