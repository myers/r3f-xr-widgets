import { Container, Content } from '@react-three/uikit'
import { XRLayer } from '@react-three/xr'
import { ReactNode } from 'react'

/**
 * Props for the BlackBorderXRLayer component
 * @group Types
 */
export interface BlackBorderXRLayerProps {
  /** Content to render in the center (typically a video XRLayer) */
  children: ReactNode
  /** Render order for the black background XRLayer. Should be less than the content's renderOrder. @default -100 */
  renderOrder?: number
}

/**
 * Wraps content with a black XRLayer background that fills the entire container.
 *
 * This is useful when you need a black background behind XRLayer content (like video)
 * but can't use UIKit backgroundColor (which would occlude the XRLayer).
 *
 * Uses XRLayer which automatically handles fallback rendering for non-XR sessions.
 *
 * @group Components
 *
 * @example
 * ```tsx
 * <BlackBorderXRLayer>
 *   <QuadVideoPlayer video={video} layerRenderOrder={0} />
 * </BlackBorderXRLayer>
 * ```
 */
export function BlackBorderXRLayer({ children, renderOrder = -100 }: BlackBorderXRLayerProps) {
  return (
    <Container
      flexGrow={1}
      width="100%"
      height="100%"
      positionType="relative"
      justifyContent="center"
      alignItems="center"
    >
      {/* Black background - positioned absolutely to fill the entire container */}
      {/* Using Content to position the XRLayer correctly within UIKit layout */}
      <Container
        positionType="absolute"
        positionTop={0}
        positionLeft={0}
        positionRight={0}
        positionBottom={0}
        transformTranslateZ={-0.02}
      >
        <Content flexGrow={1} keepAspectRatio={false}>
          {/* XRLayer with children renders to texture, then displays on a quad */}
          {/* The mesh inside defines what gets rendered to the texture */}
          <XRLayer
            shape="quad"
            pixelWidth={16}
            pixelHeight={16}
            renderOrder={renderOrder}
          >
            <mesh>
              <planeGeometry args={[10, 10]} />
              <meshBasicMaterial color="black" />
            </mesh>
          </XRLayer>
        </Content>
      </Container>

      {/* Content (video) - centered in the container, renders on top due to higher renderOrder */}
      {children}
    </Container>
  )
}
