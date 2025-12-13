import { Container, Text } from '@react-three/uikit'
import { ThumbnailCard } from './ThumbnailCard'
export interface VideoOption {
  url: string
  title: string
  thumbnail?: string
  layout: 'default' | 'mono' | 'stereo-left-right' | 'stereo-top-bottom'
}

export interface VideoSelectorProps {
  videos: VideoOption[]
  onSelect: (video: VideoOption) => void
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
      backgroundColor="black"
    >
      <Text fontSize={36} color="rgb(243,244,246)" marginBottom={20}>
        Select a Video
      </Text>

      <Container
        flexDirection="row"
        gap={20}
        flexWrap="wrap"
        justifyContent="center"
        width="100%"
        height={600}
      >
        {videos.map((video) => (
          <ThumbnailCard
            key={video.url}
            video={video}
            onSelect={onSelect}
          />
        ))}
      </Container>
    </Container>
  )
}
