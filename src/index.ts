// Components
export { ResizableWindow, type ResizableWindowProps } from './components/ResizableWindow'
export { HorizonWindow, type HorizonWindowProps } from './components/HorizonWindow'
export { HorizonWindowTitleBar, type HorizonWindowTitleBarProps } from './components/HorizonWindowTitleBar'
export { SplashScreen, type SplashScreenProps } from './components/SplashScreen'
export { EnterXRButton, type EnterXRButtonProps } from './components/EnterXRButton'
export { EyeLevelGroup, DEFAULT_EYE_LEVEL, type EyeLevelGroupProps } from './components/EyeLevelGroup'
export { AudioEffects, HandleWithAudio } from './components/HandleWithAudio'
export { Hover, type HoverProps } from './components/Hover'
export { GitHubBadge, type GitHubBadgeProps } from './components/GitHubBadge'
export { Skybox, type SkyboxProps } from './components/Skybox'
export { GridFloor, type GridFloorProps } from './components/GridFloor'
export { ArcMaterial } from './components/ArcMaterial'
export { EdgeUVMaterial } from './components/EdgeUVMaterial'
export { HorizonCursorMaterial } from './components/HorizonCursorMaterial'

// Video Player Components
export { EquirectPlayer, type EquirectPlayerProps } from './components/EquirectPlayer'
export { ControlPanelCard, ControlPanel } from './components/ControlPanel'
export { ControlPanelAutoFade, type ControlPanelAutoFadeProps } from './components/ControlPanelAutoFade'
export { VolumeControl } from './components/VolumeControl'
export { VideoSlider } from './components/VideoSlider'
export { ActionIndicator, type ActionIndicatorProps } from './components/ActionIndicator'
export { IconFlash, type IconType, type IconFlashProps } from './components/IconFlash'
export { WaitingIcon } from './components/WaitingIcon'
export { VideoXR, type VideoXRProperties } from './components/VideoXR'
export { QuadVideoPlayer, type QuadVideoPlayerProps, type VideoRenderer } from './components/QuadVideoPlayer'

// Hooks
export { useXRSessionModeSupportedPolling } from './hooks/useXRSessionModeSupportedPolling'
export { useXRButtons, type UseXRButtonsOptions, type UseXRButtonsReturn } from './hooks/useXRButtons'
export { useVideoXRControls, type UseVideoXRControlsOptions, type UseVideoXRControlsReturn, type PlaybackAction } from './hooks/useVideoXRControls'

// Utilities
export { vibrateOnEvent, type PulseConfig } from './utils/vibrateOnEvent'

// Assets
export { default as cursorTextureUrl } from './assets/images/cursor-512.png?url'

// Fonts
import montserratFontData from './assets/fonts/Montserrat-font'
export { montserratFontData as montserrat }
