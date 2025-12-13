import { Container, Text, Image } from '@react-three/uikit'
import { vibrateOnEvent } from 'r3f-xr-widgets'
import type { VideoOption } from './VideoSelector'

export interface ThumbnailCardProps {
  video: VideoOption
  onSelect: (video: VideoOption) => void
}

export function ThumbnailCard({ video, onSelect }: ThumbnailCardProps) {
  return (
    <Container
      flexGrow={1}
      flexBasis={0}
      minWidth={300}
      maxWidth={600}
      maxHeight={400}
      flexDirection="column"
      onClick={() => {
        console.log('[ThumbnailCard] Selected:', video.title)
        onSelect(video)
      }}
      onPointerEnter={(e) => vibrateOnEvent(e)}
      cursor="pointer"
      borderRadius={8}
      backgroundColor="#333333"
      overflow="hidden"
      padding={10}
      paddingBottom={6}
    >
      {/* Thumbnail Image */}
      <Container flexGrow={1} borderRadius={4} overflow="hidden">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        ) : (
          <Container
            width="100%"
            height="100%"
            justifyContent="center"
            alignItems="center"
            backgroundColor="#222222"
          >
            <Text fontSize={24} color="white" textAlign="center">
              No Preview
            </Text>
          </Container>
        )}
      </Container>

      {/* Title below image */}
      <Container paddingTop={6}>
        <Text fontSize={24} color="white" fontWeight={600}>
          {video.title}
        </Text>
      </Container>
    </Container>
  )
}
