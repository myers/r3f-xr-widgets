import { PositionalAudio } from '@react-three/drei'
import { ComponentPropsWithoutRef, forwardRef, RefObject } from 'react'
import { PositionalAudio as PAudio, Object3D } from 'three'
import { Handle, HandleState, HandleStore, defaultApply } from '@react-three/handle'
import startSoundUrl from '../assets/sounds/start.mp3?url'
import endSoundUrl from '../assets/sounds/end.mp3?url'

const handleStartAudioEffectRef: RefObject<PAudio | null> = { current: null }
const handleEndAudioEffectRef: RefObject<PAudio | null> = { current: null }

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