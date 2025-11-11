import { Signal, signal } from '@preact/signals-core'
import { HandleState } from '@react-three/handle'
import { PointerEvent } from '@pmndrs/pointer-events'
import { useFrame } from '@react-three/fiber'
import { Container, Content, Text } from '@react-three/uikit'
import { Panel } from '@react-three/uikit-horizon'
import { XIcon } from '@react-three/uikit-lucide'
import { isXRInputSourceState } from '@react-three/xr'
import { ReactNode, RefObject, useRef, useMemo, useState, useEffect } from 'react'
import { Vector3, Object3D, Group } from 'three'
import { clamp } from 'three/src/math/MathUtils.js'
import { ArcMaterial } from './ArcMaterial'
import { EdgeUVMaterial } from './EdgeUVMaterial'
import { HandleWithAudio } from './HandleWithAudio'

// Helper to vibrate controller on hover/interaction
function vibrateOnEvent(e: PointerEvent | any) {
  if (e.pointerState && isXRInputSourceState(e.pointerState) && e.pointerState.type === 'controller') {
    e.pointerState.inputSource.gamepad?.hapticActuators[0]?.pulse(0.3, 50)
  }
}

// Arc corner handle component - DRY version for all 4 corners
type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const CORNER_ROTATIONS: Record<Corner, number> = {
  'top-left': Math.PI / 2,
  'top-right': 2 * Math.PI,
  'bottom-left': -Math.PI,
  'bottom-right': -Math.PI / 2,
}

function ArcCornerHandle({
  corner,
  innerTarget,
  onResize,
  containerRef,
  handleRef,
  borderVisible,
}: {
  corner: Corner
  innerTarget: RefObject<any>
  onResize: (state: HandleState<unknown>) => void
  containerRef: RefObject<Object3D | null>
  handleRef: RefObject<Object3D | null>
  borderVisible: boolean
}) {
  const rotation = CORNER_ROTATIONS[corner]
  const label = corner.toUpperCase().replace('-', '-')
  const hapticTimeoutRef = useRef<number | null>(null)

  // Create arc material for this corner instance
  const arcMaterial = useMemo(() => {
    return new ArcMaterial(0.5, 0.083, new Vector3(1, 1, 1), 0.0)
  }, [])

  // Override hover behavior when borderVisible is true
  useEffect(() => {
    if (borderVisible) {
      arcMaterial.setOpacity(1.0)
    } else {
      arcMaterial.setOpacity(0.0)
    }
  }, [borderVisible, arcMaterial])

  return (
    <HandleWithAudio
      targetRef={innerTarget}
      translate="as-scale"
      apply={(state) => {
        // Call the actual resize handler (borderVisible controls opacity)
        onResize(state)
      }}
      handleRef={handleRef}
      scale={{ z: false, uniform: true }}
      rotate={false}
      multitouch={false}
    >
      <Container
        ref={containerRef as any}
        width={40}
        height={40}
        onPointerEnter={(e) => {
          console.log(`[${label} ARC] Pointer enter`)
          // Only apply hover effect if borderVisible is not overriding
          if (!borderVisible) {
            arcMaterial.setOpacity(1.0)
          }

          // Start delayed haptic feedback
          if (hapticTimeoutRef.current !== null) {
            clearTimeout(hapticTimeoutRef.current)
          }
          hapticTimeoutRef.current = window.setTimeout(() => {
            console.log(`[${label} ARC] Haptic feedback triggered after 500ms`)
            vibrateOnEvent(e)
          }, 500)
        }}
        onPointerLeave={(_e) => {
          console.log(`[${label} ARC] Pointer leave`)
          // Only apply hover effect if borderVisible is not overriding
          if (!borderVisible) {
            arcMaterial.setOpacity(0.0)
          }

          // Clear haptic timeout if pointer leaves before delay
          if (hapticTimeoutRef.current !== null) {
            clearTimeout(hapticTimeoutRef.current)
            hapticTimeoutRef.current = null
          }
        }}
        onPointerDown={(_e) => {
          console.log(`[${label} ARC] Pointer down`)
        }}
        onPointerUp={(_e) => {
          console.log(`[${label} ARC] Pointer up`)
        }}
      >
        <Content>
          <mesh rotation-z={rotation}>
            <planeGeometry args={[0.06, 0.06]} />
            <primitive object={arcMaterial} attach="material" />
          </mesh>
        </Content>
      </Container>
    </HandleWithAudio>
  )
}

// Edge handle component with UV-based shader
function EdgeHandle({
  orientation,
  innerTarget: _innerTarget,
  movableTarget,
  useProximity = false,
  borderVisible,
  onMove,
}: {
  orientation: 'horizontal' | 'vertical'
  innerTarget: RefObject<any>
  movableTarget: RefObject<Group>
  useProximity?: boolean
  borderVisible: boolean
  onMove: (state: HandleState<unknown>) => void
}) {
  const containerRef = useRef<Object3D>(null)
  const handleRef = useMemo(
    () => new Proxy<RefObject<Object3D | null>>({ current: null }, { get: () => containerRef.current }),
    [],
  )
  const hapticTimeoutRef = useRef<number | null>(null)

  // Create edge material for this edge instance
  const edgeMaterial = useMemo(() => {
    return new EdgeUVMaterial(0.083, new Vector3(1, 1, 1), 1.0, true, 0.5)
  }, [])

  // Control shader visibility based on borderVisible
  useEffect(() => {
    edgeMaterial.setForceVisible(borderVisible)
  }, [borderVisible, edgeMaterial])

  // Track pointer position for proximity fade using unified pointer system
  const pointerLocalPosRef = useRef(new Vector3(9999, 9999, 9999))
  const pointerWorldPosRef = useRef(new Vector3(9999, 9999, 9999))

  useFrame(() => {
    if (!useProximity || !containerRef.current) return

    // Update pointer position for proximity fade calculation
    pointerWorldPosRef.current.copy(pointerLocalPosRef.current)
    containerRef.current.localToWorld(pointerWorldPosRef.current)
    edgeMaterial.uniforms.uPointerPosition.value.copy(pointerWorldPosRef.current)
  })

  return (
    <HandleWithAudio
      targetRef={movableTarget}
      handleRef={handleRef}
      translate={{ x: true, y: true, z: true }}
      scale={false}
      rotate={false}
      multitouch={false}
      apply={(state) => {
        console.log('[EDGE HANDLE APPLY]', {
          first: state.first,
          last: state.last,
          position: state.current.position,
          targetExists: !!movableTarget.current
        })
        // Control border visibility
        onMove(state)
        // Move the window
        if (movableTarget.current) {
          movableTarget.current.position.copy(state.current.position)
        }
      }}
    >
      <Container
        ref={containerRef as any}
        flexGrow={1}
        width={orientation === 'vertical' ? 40 : undefined}
        height={orientation === 'horizontal' ? 40 : undefined}
        onPointerEnter={(e) => {
          console.log('[EDGE HANDLE CONTAINER] Pointer enter')

          // Start delayed haptic feedback
          if (hapticTimeoutRef.current !== null) {
            clearTimeout(hapticTimeoutRef.current)
          }
          hapticTimeoutRef.current = window.setTimeout(() => {
            console.log('[EDGE HANDLE CONTAINER] Haptic feedback triggered after 500ms')
            vibrateOnEvent(e)
          }, 500)
        }}
        onPointerMove={(e) => {
          if (e.point && containerRef.current) {
            pointerLocalPosRef.current.copy(e.point)
            containerRef.current.worldToLocal(pointerLocalPosRef.current)
          }
        }}
        onPointerLeave={() => {
          console.log('[EDGE HANDLE CONTAINER] Pointer leave')
          pointerLocalPosRef.current.set(9999, 9999, 9999)

          // Clear haptic timeout if pointer leaves before delay
          if (hapticTimeoutRef.current !== null) {
            clearTimeout(hapticTimeoutRef.current)
            hapticTimeoutRef.current = null
          }
        }}
      >
        <Content keepAspectRatio={false} flexGrow={1}>
          <mesh
            rotation-z={orientation === 'vertical' ? Math.PI / 2 : 0}
            scale={0.12}
          >
            <planeGeometry args={[1, 1]} />
            <primitive object={edgeMaterial} attach="material" />
          </mesh>
        </Content>
      </Container>
    </HandleWithAudio>
  )
}

// UIKit-based HorizonWindow component
export function HorizonWindow({
  children,
  width: widthProp,
  height: heightProp,
  minWidth = 300,
  maxWidth = 1000,
  minHeight = 250,
  maxHeight = 700,
  pixelSize = 0.0015,
  useProximity: _useProximity = false,
  onResize,
  title,
  onClose,
}: {
  children?: ReactNode
  width: number | Signal<number>
  height: number | Signal<number>
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  pixelSize?: number
  useProximity?: boolean
  onResize?: (width: number, height: number) => void
  title?: string
  onClose?: () => void
}) {
  // Convert width/height props to signals if needed
  const width = useMemo(
    () => typeof widthProp === 'number' ? signal(widthProp) : widthProp,
    [widthProp]
  )
  const height = useMemo(
    () => typeof heightProp === 'number' ? signal(heightProp) : heightProp,
    [heightProp]
  )

  const innerTarget = useRef<any>(null)
  const movableGroupRef = useRef<Group>(null!)
  const initialHeight = useRef<number | undefined>(undefined)
  const initialWidth = useRef<number | undefined>(undefined)

  // Border visibility state - controls all corners and edges during resize/move
  const [borderVisible, setBorderVisible] = useState(false)

  // Container refs for each corner
  const topLeftContainerRef = useRef<Object3D>(null)
  const topRightContainerRef = useRef<Object3D>(null)
  const bottomLeftContainerRef = useRef<Object3D>(null)
  const bottomRightContainerRef = useRef<Object3D>(null)

  // Title bar container ref
  const titleBarContainerRef = useRef<Object3D>(null)

  // Create proxies for each corner handle
  const topLeftHandleRef = useMemo(
    () => new Proxy<RefObject<Object3D | null>>({ current: null }, { get: () => topLeftContainerRef.current }),
    [],
  )
  const topRightHandleRef = useMemo(
    () => new Proxy<RefObject<Object3D | null>>({ current: null }, { get: () => topRightContainerRef.current }),
    [],
  )
  const bottomLeftHandleRef = useMemo(
    () => new Proxy<RefObject<Object3D | null>>({ current: null }, { get: () => bottomLeftContainerRef.current }),
    [],
  )
  const bottomRightHandleRef = useMemo(
    () => new Proxy<RefObject<Object3D | null>>({ current: null }, { get: () => bottomRightContainerRef.current }),
    [],
  )
  const titleBarHandleRef = useMemo(
    () => new Proxy<RefObject<Object3D | null>>({ current: null }, { get: () => titleBarContainerRef.current }),
    [],
  )

  // Shared resize callback for all corner handles
  const handleResize = (state: HandleState<unknown>) => {
    console.log('[HANDLE RESIZE]', { first: state.first, last: state.last, height, width, heightValue: height?.value, widthValue: width?.value })
    if (state.first) {
      initialHeight.current = height.value
      initialWidth.current = width.value
      setBorderVisible(true)
    } else if (!state.first && initialHeight.current != null && initialWidth.current != null) {
      // Update signals during drag for real-time resizing
      const newHeight = clamp(state.current.scale.y * initialHeight.current, minHeight, maxHeight)
      const newWidth = clamp(state.current.scale.x * initialWidth.current, minWidth, maxWidth)
      height.value = newHeight
      width.value = newWidth
      if (state.last) {
        onResize?.(newWidth, newHeight)
        setBorderVisible(false)
      }
    }
  }

  // Shared move callback for all edge handles
  const handleEdgeMove = (state: HandleState<unknown>) => {
    if (state.first) {
      setBorderVisible(true)
    } else if (state.last) {
      setBorderVisible(false)
    }
  }

  return (
    <group ref={movableGroupRef}>
      <Container
        flexDirection="column"
        width={width}
        height={height}
        pixelSize={pixelSize}
      >
        {/* Top row: Top-Left + Spacer + Top-Right */}
        <Container flexDirection="row" height={40}>
          {/* Top-Left Corner */}
          <ArcCornerHandle
            corner="top-left"
            innerTarget={innerTarget}
            onResize={handleResize}
            containerRef={topLeftContainerRef}
            handleRef={topLeftHandleRef}
            borderVisible={borderVisible}
          />

          {/* Top edge handle */}
          <EdgeHandle
            orientation="horizontal"
            innerTarget={innerTarget}
            movableTarget={movableGroupRef}
            useProximity={true}
            borderVisible={borderVisible}
            onMove={handleEdgeMove}
          />

          {/* Top-Right Corner */}
          <ArcCornerHandle
            corner="top-right"
            innerTarget={innerTarget}
            onResize={handleResize}
            containerRef={topRightContainerRef}
            handleRef={topRightHandleRef}
            borderVisible={borderVisible}
          />
        </Container>

        {/* Middle row: Left edge + Content + Right edge */}
        <Container flexDirection="row" flexGrow={1}>
          {/* Left edge handle */}
          <Container width={40}>
            <EdgeHandle
              orientation="vertical"
              innerTarget={innerTarget}
              movableTarget={movableGroupRef}
              useProximity={true}
              borderVisible={borderVisible}
              onMove={handleEdgeMove}
            />
          </Container>

          <Container flexGrow={1} ref={innerTarget} backgroundColor={"black"}>
            {children}
          </Container>

          {/* Right edge handle */}
          <Container width={40}>
            <EdgeHandle
              orientation="vertical"
              innerTarget={innerTarget}
              movableTarget={movableGroupRef}
              useProximity={true}
              borderVisible={borderVisible}
              onMove={handleEdgeMove}
            />
          </Container>
        </Container>

        {/* Bottom row: Bottom-Left + Spacer + Bottom-Right */}
        <Container flexDirection="row" height={40}>
          {/* Bottom-Left Corner */}
          <ArcCornerHandle
            corner="bottom-left"
            innerTarget={innerTarget}
            onResize={handleResize}
            containerRef={bottomLeftContainerRef}
            handleRef={bottomLeftHandleRef}
            borderVisible={borderVisible}
          />

          {/* Bottom edge handle */}
          <EdgeHandle
            orientation="horizontal"
            innerTarget={innerTarget}
            movableTarget={movableGroupRef}
            useProximity={true}
            borderVisible={borderVisible}
            onMove={handleEdgeMove}
          />

          {/* Bottom-Right Corner */}
          <ArcCornerHandle
            corner="bottom-right"
            innerTarget={innerTarget}
            onResize={handleResize}
            containerRef={bottomRightContainerRef}
            handleRef={bottomRightHandleRef}
            borderVisible={borderVisible}
          />
        </Container>

        {/* Title bar row - 0.75m width */}

        <Container ref={titleBarContainerRef as any} width={500} height={60} alignSelf="center" marginTop={10}>
          <HandleWithAudio
            targetRef={movableGroupRef}
            handleRef={titleBarHandleRef}
            translate={{ x: true, y: true, z: true }}
            scale={false}
            rotate={false}
            multitouch={false}
            apply={(state) => {
              if (state.first) {
                setBorderVisible(true)
              } else if (state.last) {
                setBorderVisible(false)
              }
              if (movableGroupRef.current) {
                movableGroupRef.current.position.copy(state.current.position)
              }
            }}
          >
            <Panel padding={12} width="100%">
              <Container flexDirection="row" alignItems="center" gap={16} flexGrow={1}>
                {title && (
                  <Text fontSize={24} color="white">
                    {title}
                  </Text>
                )}
                <Container flexGrow={1} />
                {onClose && (
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
                )}
              </Container>
            </Panel>
          </HandleWithAudio>
        </Container>
      </Container>
    </group>
  )
}
