import { useFrame } from "@react-three/fiber"
import { XRLayer, useXRInputSourceState } from "@react-three/xr"
import { useMemo, useState } from "react"
import { ControlPanelRoot } from "./ControlPanel"
import { ActionIndicator } from "./ActionIndicator"
import { useSpring, animated } from "@react-spring/three"

interface EquirectPlayerProps {
  title?: string
  videoUrl: string
  videoAngle?: number
  layout?: XRLayerLayout
}

export function EquirectPlayer({
  title,
  videoUrl,
  videoAngle = 180,
  layout = "stereo-left-right",
}: EquirectPlayerProps) {
  const [buttonADown, setButtonADown] = useState(false)
  const [buttonBDown, setButtonBDown] = useState(false)
  const [controlPanelVisible, setControlPanelVisible] = useState(true)
  const [moveRightDown, setMoveRightDown] = useState(false)
  const [moveLeftDown, setMoveLeftDown] = useState(false)
  const controllerRight = useXRInputSourceState("controller", "right")
  const video: HTMLVideoElement = useMemo(() => {
    const videoElement = document.createElement("video")
    videoElement.src = videoUrl
    videoElement.crossOrigin = "anonymous"
    videoElement.preload = "auto"
    return videoElement
  }, [videoUrl])

  const springs = useSpring({
    opacity: controlPanelVisible ? 0.4 : 0,
    config: { duration: 200 },
  })

  useFrame(() => {
    if (!controllerRight) {
      return
    }
    const rightGamepad = controllerRight.inputSource.gamepad
    if (!rightGamepad || !video) {
      return
    }

    // Check if thumbstick is pushed right (x > 0.5)
    if (rightGamepad.axes[2] > 0.5 && !moveRightDown) {
      setMoveRightDown(true)
      console.log("thumbstick right: ff")
      video.currentTime += 10
    }
    if (rightGamepad.axes[2] < 0.5 && moveRightDown) {
      setMoveRightDown(false)
    }
    // Check if thumbstick is pushed left (x < -0.5)
    if (rightGamepad.axes[2] < -0.5 && !moveLeftDown) {
      setMoveLeftDown(true)
      console.log("thumbstick left: rew")
      video.currentTime -= 10
    }
    if (rightGamepad.axes[2] > -0.5 && moveLeftDown) {
      setMoveLeftDown(false)
    }

    // Handle B button for toggling control panel
    if (
      controllerRight?.gamepad?.["b-button"]?.state === "pressed" &&
      !buttonBDown
    ) {
      setButtonBDown(true)
      setControlPanelVisible((prev) => !prev)
    }
    if (
      controllerRight?.gamepad?.["b-button"]?.state !== "pressed" &&
      buttonBDown
    ) {
      setButtonBDown(false)
    }

    // Check if A button is pressed (button 0)
    if (
      controllerRight?.gamepad?.["a-button"]?.state === "pressed" &&
      !buttonADown
    ) {
      setButtonADown(true)
      console.log("A button pressed")
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
    }
    if (
      controllerRight?.gamepad?.["a-button"]?.state !== "pressed" &&
      buttonADown
    ) {
      setButtonADown(false)
    }
  })

  return (
    <group>
      <XRLayer
        src={video}
        layout={layout}
        shape="equirect"
        centralHorizontalAngle={(Math.PI * videoAngle) / 180}
        upperVerticalAngle={Math.PI / 2.0}
        lowerVerticalAngle={-Math.PI / 2.0}
        scale={100}
      />
      <group position={[0, 1, -1]}>
        <ActionIndicator video={video} />
      </group>
      {controlPanelVisible && (
        <animated.group {...springs}>
          <ControlPanelRoot video={video} title={title} />
        </animated.group>
      )}
    </group>
  )
}
