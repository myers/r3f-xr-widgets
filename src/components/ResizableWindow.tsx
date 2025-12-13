import { RoundedBox, useGLTF } from '@react-three/drei'
import { ReactNode, useRef, useState, useEffect } from 'react'
import { Group, Mesh, Vector3 } from 'three'
import { HandleTarget, HandleStore, defaultApply } from '@react-three/handle'
import { HandleWithAudio } from './HandleWithAudio'
import { Hover } from './Hover'
import { CylindricalBillboard } from './CylindricalBillboard'
import rotateModelUrl from '../assets/models/rotate.glb?url'

/**
 * Props for the ResizableWindow component
 * @group Types
 */
export interface ResizableWindowProps {
  /** React children to render inside the window */
  children?: ReactNode
  /** Initial position in 3D space [x, y, z]. Defaults to [0, 0, -0.4] */
  position?: [number, number, number]
  /** Initial scale [x, y, z]. Not commonly used - use baseScale instead */
  scale?: [number, number, number]
  /** Rotate window to face camera on mount. Defaults to true */
  initiallyRotateTowardsCamera?: boolean
  /** Continuously rotate window to face camera. Defaults to false */
  autoRotateToCamera?: boolean
  /** Rotate window to face camera while dragging. Defaults to true */
  rotateOnDrag?: boolean
  /** Callback when window position changes */
  onPositionChange?: (position: Vector3) => void
  /** Callback when window scale changes */
  onScaleChange?: (scale: Vector3) => void
  /** Aspect ratio (width/height) of the window. Defaults to 16/9 */
  aspectRatio?: number
  /** Base size of the window in meters. Defaults to 0.3 */
  baseScale?: number
  /** Color of the drag and resize handles. Defaults to 'grey' */
  handleColor?: string | number
}

function RotateGeometry() {
  const { scene } = useGLTF(rotateModelUrl)
  return <primitive attach="geometry" object={(scene.children[2] as Mesh).geometry} />
}

/**
 * An interactive 3D window component with drag-to-move and resize handles.
 *
 * Features:
 * - Drag the bottom handle to move the window in 3D space
 * - Drag the top-right handle to resize the window
 * - Positional audio feedback on interaction
 * - Haptic feedback on XR controllers
 * - Optional camera-facing rotation (initial or continuous)
 *
 * @group Components
 *
 * @example
 * ```tsx
 * import { ResizableWindow, AudioEffects } from 'r3f-xr-widgets'
 *
 * function Scene() {
 *   return (
 *     <>
 *       <AudioEffects />
 *       <ResizableWindow
 *         position={[0, 1.5, -1]}
 *         aspectRatio={16/9}
 *         baseScale={0.3}
 *         handleColor="hotpink"
 *       >
 *         <mesh>
 *           <boxGeometry />
 *           <meshStandardMaterial />
 *         </mesh>
 *       </ResizableWindow>
 *     </>
 *   )
 * }
 * ```
 *
 * Adapted from @react-three/xr editor example
 * @see {@link https://github.com/pmndrs/xr/tree/main/examples/editor}
 */
export function ResizableWindow(props: ResizableWindowProps) {
  const {
    children,
    position = [0, 0, -0.4],
    initiallyRotateTowardsCamera = true,
    autoRotateToCamera = false,
    rotateOnDrag = true,
    onScaleChange,
    aspectRatio = 16 / 9,
    baseScale = 0.3,
    handleColor = 'grey'
  } = props
  const groupRef = useRef<Group>(null)
  const storeRef = useRef<HandleStore<unknown>>(null)
  const [windowPosition, setWindowPosition] = useState(position)
  const [currentScale, setCurrentScale] = useState(1)

  // Update position when prop changes
  useEffect(() => {
    setWindowPosition(position)
  }, [position])

  return (
    <HandleTarget ref={groupRef}>
      <group position={windowPosition}>
        <CylindricalBillboard initialRotation={initiallyRotateTowardsCamera} autoRotate={autoRotateToCamera} rotateOnDrag={rotateOnDrag}>
          <group>
            <HandleTarget>
              {/* Background plane */}
              <mesh rotation-y={Math.PI}>
                <planeGeometry args={[baseScale * aspectRatio, baseScale]} />
                <meshBasicMaterial color="#222222" />
              </mesh>

              {/* Content area - no scaling applied, just positioned */}
              <group>
                {children}
              </group>

              {/* Resize handle (top-right) */}
              <HandleWithAudio
                targetRef="from-context"
                translate="as-scale"
                apply={(state, target) => {
                  defaultApply(state, target)
                  target.scale.z = state.current.scale.x
                  setCurrentScale(state.current.scale.x)
                  onScaleChange?.(state.current.scale)
                }}
                scale={{ z: false, uniform: true }}
                rotate={false}
              >
                <Hover>
                  {(hovered) => (
                    <mesh
                      rotation-x={Math.PI / 2}
                      rotation-z={Math.PI}
                      position={[
                        (baseScale * aspectRatio / 2) + (hovered ? 0.035 : 0.03) / currentScale,
                        (baseScale / 2) + (hovered ? 0.025 : 0.02) / currentScale,
                        0
                      ]}
                      scale={(hovered ? 0.035 : 0.025) / currentScale}
                    >
                      <RotateGeometry />
                      <meshStandardMaterial
                        emissiveIntensity={hovered ? 0.3 : 0}
                        emissive={0xffffff}
                        toneMapped={false}
                        color={handleColor}
                      />
                    </mesh>
                  )}
                </Hover>
              </HandleWithAudio>
            </HandleTarget>
          </group>

          {/* Move handle (bottom) */}
          <group position={[0, (-baseScale / 2 - 0.03) * currentScale, 0]}>
            <HandleWithAudio targetRef="from-context" ref={storeRef} scale={false} multitouch={false} rotate={false}>
              <Hover>
                {(hovered) => (
                  <RoundedBox scale={hovered ? 0.125 : 0.1} args={[2, 0.2, 0.2]}>
                    <meshStandardMaterial
                      emissiveIntensity={hovered ? 0.3 : 0}
                      emissive={0xffffff}
                      toneMapped={false}
                      color={handleColor}
                    />
                  </RoundedBox>
                )}
              </Hover>
            </HandleWithAudio>
          </group>
        </CylindricalBillboard>
      </group>
    </HandleTarget>
  )
}
