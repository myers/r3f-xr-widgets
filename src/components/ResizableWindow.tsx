import { RoundedBox, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { ReactNode, useRef, useState, useEffect } from 'react'
import { Euler, Group, Mesh, Quaternion, Vector3 } from 'three'
import { damp } from 'three/src/math/MathUtils.js'
import { HandleTarget, HandleStore, defaultApply } from '@react-three/handle'
import { HandleWithAudio } from './HandleWithAudio'
import { Hover } from './Hover'
import rotateModelUrl from '../assets/models/rotate.glb?url'

// Helper objects for rotation calculations
const eulerHelper = new Euler()
const quaternionHelper = new Quaternion()
const vectorHelper1 = new Vector3()
const vectorHelper2 = new Vector3()
const zAxis = new Vector3(0, 0, 1)

interface ResizableWindowProps {
  children?: ReactNode
  position?: [number, number, number]
  scale?: [number, number, number]
  initiallyRotateTowardsCamera?: boolean
  autoRotateToCamera?: boolean
  onPositionChange?: (position: Vector3) => void
  onScaleChange?: (scale: Vector3) => void
  aspectRatio?: number
  baseScale?: number
  handleColor?: string | number
}

function RotateGeometry() {
  const { scene } = useGLTF(rotateModelUrl)
  return <primitive attach="geometry" object={(scene.children[2] as Mesh).geometry} />
}

export function ResizableWindow({
  children,
  position = [0, 0, -0.4],
  initiallyRotateTowardsCamera = true,
  autoRotateToCamera = false,
  onScaleChange,
  aspectRatio = 16 / 9,
  baseScale = 0.3,
  handleColor = 'grey'
}: ResizableWindowProps) {
  const groupRef = useRef<Group>(null)
  const rotatingGroupRef = useRef<Group>(null)
  const storeRef = useRef<HandleStore<unknown>>(null)
  const [windowPosition, setWindowPosition] = useState(position)
  const [hasInitiallyRotated, setHasInitiallyRotated] = useState(false)
  const [currentScale, setCurrentScale] = useState(1)
  
  // Update position when prop changes
  useEffect(() => {
    setWindowPosition(position)
  }, [position])

  // Auto-rotate to face camera
  useFrame((state, dt) => {
    if (rotatingGroupRef.current == null) {
      return
    }
    
    // Handle initial rotation
    if (initiallyRotateTowardsCamera && !hasInitiallyRotated) {
      state.camera.getWorldPosition(vectorHelper1)
      rotatingGroupRef.current.getWorldPosition(vectorHelper2)
      quaternionHelper.setFromUnitVectors(zAxis, vectorHelper1.sub(vectorHelper2).normalize())
      eulerHelper.setFromQuaternion(quaternionHelper, 'YXZ')
      rotatingGroupRef.current.rotation.y = eulerHelper.y
      setHasInitiallyRotated(true)
      return
    }
    
    // Handle continuous rotation
    if (!autoRotateToCamera) {
      return
    }
    
    // Only rotate if not being dragged
    const handleState = storeRef.current?.getState()
    if (handleState && handleState.current.pointerAmount > 0) {
      return
    }
    state.camera.getWorldPosition(vectorHelper1)
    rotatingGroupRef.current.getWorldPosition(vectorHelper2)
    quaternionHelper.setFromUnitVectors(zAxis, vectorHelper1.sub(vectorHelper2).normalize())
    eulerHelper.setFromQuaternion(quaternionHelper, 'YXZ')
    rotatingGroupRef.current.rotation.y = damp(rotatingGroupRef.current.rotation.y, eulerHelper.y, 10, dt)
  })

  return (
    <HandleTarget ref={groupRef}>
      <group position={windowPosition}>
        <group ref={rotatingGroupRef}>
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
                  <RoundedBox scale={(hovered ? 0.125 : 0.1) * currentScale} args={[2, 0.2, 0.2]}>
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
        </group>
      </group>
    </HandleTarget>
  )
}