import { Container, Text } from '@react-three/uikit'
import { colors } from '@react-three/uikit-default'

export interface VideoOption {
  url: string
  title: string
  thumbnail?: string
}

export interface VideoSelectorProps {
  videos: VideoOption[]
  onSelect: (url: string, title: string) => void
}

export function VideoSelector({ videos, onSelect }: VideoSelectorProps) {
  return (
    <Container
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={20}
      flexGrow={1}
      padding={40}
    >
      <Text fontSize={36} color="rgb(243,244,246)" marginBottom={20}>
        Select a Video
      </Text>

      <Container
        flexDirection="row"
        gap={20}
        flexWrap="wrap"
        justifyContent="center"
      >
        {videos.map((video) => (
          <Container
            key={video.url}
            onClick={() => {
              console.log('[VideoSelector] Selected:', video.title)
              onSelect(video.url, video.title)
            }}
            padding={20}
            backgroundColor={colors.buttonBackground}
            borderRadius={8}
            cursor="pointer"
            hover={{
              backgroundColor: colors.buttonBackgroundHover,
            }}
            width={300}
            height={200}
            justifyContent="center"
            alignItems="center"
          >
            <Text fontSize={24} color="white" textAlign="center">
              {video.title}
            </Text>
          </Container>
        ))}
      </Container>
    </Container>
  )
}
