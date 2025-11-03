import { ReactNode, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useXRInputSourceState, XRSpace } from '@react-three/xr'
import { PulseConfig } from '../utils/vibrateOnEvent'

/**
 * Configuration for a single section in the radial menu
 */
export interface RadialMenuSection {
  /** Unique identifier for this section */
  id: string
  /** Optional label text */
  label?: string
  /** Optional user data passed to callbacks */
  data?: any
}

/**
 * Props for the RadialMenu component
 */
export interface RadialMenuProps {
  /** Which controller hand to track. Defaults to 'right' */
  hand?: 'left' | 'right'
  /** Controller button that triggers the menu. Defaults to 'b-button' */
  triggerButton?: string
  /** Array of menu sections */
  sections: RadialMenuSection[]
  /** Callback fired when a section is selected on button release */
  onSelect?: (section: RadialMenuSection | null, index: number) => void
  /** Radius of the menu in meters. Defaults to 0.1 */
  radius?: number
  /** Dead zone for thumbstick input (0-1). Defaults to 0.3 */
  deadZone?: number
  /** Haptic feedback configuration */
  haptic?: PulseConfig
  /** Custom renderer for sections. Receives section data, index, and highlighted state */
  children?: (section: RadialMenuSection, index: number, highlighted: boolean) => ReactNode
}


/**
 * Default section renderer - creates a simple wedge with scaling effect
 */
function DefaultSectionRenderer({
  section,
  index,
  highlighted,
  totalSections,
  radius,
}: {
  section: RadialMenuSection
  index: number
  highlighted: boolean
  totalSections: number
  radius: number
}) {
  const anglePerSection = (Math.PI * 2) / totalSections
  const startAngle = index * anglePerSection - Math.PI / 2
  const midAngle = startAngle + anglePerSection / 2

  // Position at the mid-point of the section's arc
  const x = Math.cos(midAngle) * radius
  const y = Math.sin(midAngle) * radius

  const scale = highlighted ? 1.3 : 1

  return (
    <group position={[x, y, 0]}>
      <mesh scale={scale}>
        <circleGeometry args={[0.02, 16]} />
        <meshBasicMaterial color={highlighted ? '#00ff00' : '#ffffff'} transparent opacity={0.8} />
      </mesh>
      {section.label && (
        <mesh position={[0, -0.03, 0]} scale={scale}>
          <planeGeometry args={[0.05, 0.02]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  )
}

/**
 * RadialMenu - XR radial menu component
 *
 * Displays a circular menu when a controller button is held down.
 * Use the controller's thumbstick to highlight sections.
 * Release the button to select the highlighted section.
 *
 * @example
 * ```tsx
 * <RadialMenu
 *   hand="right"
 *   triggerButton="b-button"
 *   sections={[
 *     { id: 'option1', label: 'Option 1' },
 *     { id: 'option2', label: 'Option 2' },
 *   ]}
 *   onSelect={(section) => console.log('Selected:', section?.id)}
 * />
 * ```
 */
export function RadialMenu({
  hand = 'right',
  triggerButton = 'b-button',
  sections,
  onSelect,
  radius = 0.1,
  deadZone = 0.3,
  haptic,
  children,
}: RadialMenuProps) {
  // Controller state
  const controller = useXRInputSourceState('controller', hand)

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false)
  const [buttonDown, setButtonDown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  // Previous highlighted index for haptic feedback
  const prevHighlightedRef = useRef(-1)
  const hasLoggedGamepad = useRef(false)
  const hasLoggedController = useRef(false)

  useFrame(() => {
    // Log when controller first appears
    if (controller && !hasLoggedController.current) {
      console.log('[RadialMenu] ✅ Controller connected!', controller)
      hasLoggedController.current = true
    }

    if (!controller?.gamepad) {
      if (Math.random() < 0.01) { // Log occasionally, not every frame
        console.log('[RadialMenu] Waiting for controller with gamepad...')
      }
      return
    }

    // Log gamepad structure once to see available buttons
    if (!hasLoggedGamepad.current) {
      console.log('[RadialMenu] Gamepad object:', controller.gamepad)
      console.log('[RadialMenu] Gamepad keys:', Object.keys(controller.gamepad))
      hasLoggedGamepad.current = true
    }

    // Get button state (using optional chaining like examples)
    const button = controller.gamepad[triggerButton as keyof typeof controller.gamepad]
    const isPressed = button?.state === 'pressed'

    // Debug logging (temporary)
    if (Math.random() < 0.05) { // Log occasionally
      console.log(`[RadialMenu] Button "${triggerButton}" state:`, button?.state, 'isPressed:', isPressed)
    }

    // Detect button press (rising edge)
    if (isPressed && !buttonDown) {
      console.log('[RadialMenu] Button PRESSED - showing menu')
      setButtonDown(true)
      setMenuVisible(true)
    }

    // Detect button release (falling edge)
    if (!isPressed && buttonDown) {
      console.log('[RadialMenu] Button RELEASED - hiding menu, selected index:', highlightedIndex)
      setButtonDown(false)
      setMenuVisible(false)

      // Fire callback with selected section
      if (highlightedIndex >= 0 && highlightedIndex < sections.length) {
        console.log('[RadialMenu] Selected section:', sections[highlightedIndex])

        // Trigger haptic feedback on selection
        if (controller.inputSource.gamepad?.hapticActuators?.[0]) {
          const pulseValue = haptic?.value ?? 0.7
          const pulseDuration = haptic?.duration ?? 150
          controller.inputSource.gamepad.hapticActuators[0].pulse(pulseValue, pulseDuration)
        }

        onSelect?.(sections[highlightedIndex], highlightedIndex)
      } else {
        console.log('[RadialMenu] No section selected (dead zone or invalid index)')
        onSelect?.(null, -1)
      }

      // Reset state
      setHighlightedIndex(-1)
      prevHighlightedRef.current = -1
    }

    // While menu is visible, track thumbstick input
    if (menuVisible && isPressed) {
      const thumbstick = controller.gamepad['xr-standard-thumbstick']
      const axisX = thumbstick?.xAxis ?? 0
      const axisY = thumbstick?.yAxis ?? 0

      const magnitude = Math.sqrt(axisX * axisX + axisY * axisY)

      if (magnitude > deadZone) {
        // Calculate angle from thumbstick (-π to π)
        // Negate X-axis and apply -π/2 offset to align with visual renderer positioning
        const angle = Math.atan2(axisY, -axisX) - Math.PI / 2

        // Map angle to section index
        // Normalize to 0 to 2π, then divide by section angle
        const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle
        const sectionAngle = (Math.PI * 2) / sections.length
        let index = Math.floor(normalizedAngle / sectionAngle)

        // Clamp to valid range
        index = Math.max(0, Math.min(sections.length - 1, index))
        console.log('[RadialMenu] Selected index:', index, 'angle:', angle)

        // Update highlighted section
        if (index !== highlightedIndex) {
          console.log('[RadialMenu] Highlighting section:', index)
          setHighlightedIndex(index)

          // Trigger haptic feedback on section change
          if (index !== prevHighlightedRef.current && controller.inputSource.gamepad?.hapticActuators?.[0]) {
            const pulseValue = haptic?.value ?? 0.3
            const pulseDuration = haptic?.duration ?? 50
            controller.inputSource.gamepad.hapticActuators[0].pulse(pulseValue, pulseDuration)
          }

          prevHighlightedRef.current = index
        }
      } else {
        // Inside dead zone - no selection
        if (highlightedIndex !== -1) {
          console.log('[RadialMenu] Entering dead zone')
          setHighlightedIndex(-1)
          prevHighlightedRef.current = -1
        }
      }
    }
  })

  if (!menuVisible || !controller?.inputSource?.targetRaySpace) return null

  return (
    <XRSpace space={controller.inputSource.targetRaySpace}>
      {/* Offset forward along the pointing ray */}
      <group position={[0, 0, -0.15]} rotation={[0, 0, 0]}>
        {/* Background circle */}
        <mesh>
          <ringGeometry args={[radius * 0.7, radius * 1.3, 32]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.7} />
        </mesh>

        {/* Render sections */}
        {sections.map((section, index) => {
          const highlighted = index === highlightedIndex

          return (
            <group key={section.id}>
              {children ? (
                children(section, index, highlighted)
              ) : (
                <DefaultSectionRenderer
                  section={section}
                  index={index}
                  highlighted={highlighted}
                  totalSections={sections.length}
                  radius={radius}
                />
              )}
            </group>
          )
        })}
      </group>
    </XRSpace>
  )
}
