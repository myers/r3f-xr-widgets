/**
 * HandleWithAudio component and audio feedback utilities
 *
 * Adapted from @react-three/xr editor example
 * Original: https://github.com/pmndrs/xr/tree/main/examples/editor
 */

import { PositionalAudio } from '@react-three/drei'
import { ComponentPropsWithoutRef, forwardRef, RefObject } from 'react'
import { PositionalAudio as PAudio, Object3D } from 'three'
import { Handle, HandleState, HandleStore, defaultApply } from '@react-three/handle'
import startSoundUrl from '../assets/sounds/start.mp3?url'
import endSoundUrl from '../assets/sounds/end.mp3?url'

const handleStartAudioEffectRef: RefObject<PAudio | null> = { current: null }
const handleEndAudioEffectRef: RefObject<PAudio | null> = { current: null }

/**
 * Global audio effect sources for HandleWithAudio interactions
 *
 * Renders two invisible PositionalAudio sources that HandleWithAudio components reference
 * for spatial audio feedback. The audio sources are positioned at the handle's location
 * when interactions begin and end.
 *
 * Must be placed somewhere in your scene (typically at the root level) for HandleWithAudio
 * components to have audio feedback.
 *
 * @group Components
 *
 * @example
 * ```tsx
 * import { Canvas } from '@react-three/fiber'
 * import { AudioEffects, ResizableWindow } from 'r3f-xr-widgets'
 *
 * function App() {
 *   return (
 *     <Canvas>
 *       <AudioEffects />
 *       <ResizableWindow>
 *         {/* content *\/}
 *       </ResizableWindow>
 *     </Canvas>
 *   )
 * }
 * ```
 *
 * @see {@link HandleWithAudio}
 */
export function AudioEffects() {
  return (
    <>
      <PositionalAudio loop={false} ref={handleStartAudioEffectRef} url={startSoundUrl} />
      <PositionalAudio loop={false} ref={handleEndAudioEffectRef} url={endSoundUrl} />
    </>
  )
}

export function applyWithAudioEffect(
  state: HandleState<unknown>,
  target: Object3D,
  apply: typeof defaultApply | undefined
) {
  if (state.first && handleStartAudioEffectRef.current != null) {
    target.getWorldPosition(handleStartAudioEffectRef.current.position)
    handleStartAudioEffectRef.current.setVolume(0.3)
    if (handleStartAudioEffectRef.current.isPlaying) {
      handleStartAudioEffectRef.current.stop()
    }
    handleStartAudioEffectRef.current.play()
  }
  if (state.last && handleEndAudioEffectRef.current != null) {
    target.getWorldPosition(handleEndAudioEffectRef.current.position)
    handleEndAudioEffectRef.current.setVolume(0.3)
    if (handleEndAudioEffectRef.current.isPlaying) {
      handleEndAudioEffectRef.current.stop()
    }
    handleEndAudioEffectRef.current.play()
  }
  return (apply ?? defaultApply)(state, target)
}

/**
 * Handle component wrapper with audio feedback
 *
 * Drop-in replacement for `@react-three/handle`'s Handle component that adds positional
 * audio feedback when drag interactions start and end. Plays spatial sound effects that
 * are positioned at the handle's 3D location.
 *
 * Requires the {@link AudioEffects} component to be present in the scene to provide
 * the audio sources.
 *
 * @group Components
 *
 * @example Basic usage
 * ```tsx
 * import { Canvas } from '@react-three/fiber'
 * import { AudioEffects, HandleWithAudio } from 'r3f-xr-widgets'
 * import { HandleTarget } from '@react-three/handle'
 *
 * function App() {
 *   return (
 *     <Canvas>
 *       <AudioEffects />
 *       <HandleTarget>
 *         <mesh>
 *           <boxGeometry />
 *           <meshStandardMaterial />
 *         </mesh>
 *         <HandleWithAudio>
 *           <mesh position={[0, -0.6, 0]}>
 *             <sphereGeometry args={[0.1]} />
 *             <meshStandardMaterial color="hotpink" />
 *           </mesh>
 *         </HandleWithAudio>
 *       </HandleTarget>
 *     </Canvas>
 *   )
 * }
 * ```
 *
 * @example With custom apply function
 * ```tsx
 * <HandleWithAudio
 *   apply={(state, target) => {
 *     // Custom transformation logic
 *     target.position.copy(state.worldPosition)
 *     return false // Return false to prevent default apply
 *   }}
 * >
 *   {/* handle visuals *\/}
 * </HandleWithAudio>
 * ```
 *
 * @see {@link AudioEffects}
 * @see {@link https://github.com/pmndrs/handle | @react-three/handle documentation}
 */
export const HandleWithAudio = forwardRef<HandleStore<unknown>, ComponentPropsWithoutRef<typeof Handle>>(
  (props, ref) => {
    return (
      <Handle
        {...props}
        apply={(state, target) => applyWithAudioEffect(state, target, props.apply)}
        ref={ref}
      />
    )
  }
)

HandleWithAudio.displayName = 'HandleWithAudio'
