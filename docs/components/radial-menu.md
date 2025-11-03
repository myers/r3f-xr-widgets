# RadialMenu

<Badge type="tip" text="XR-Optimized" /> <Badge type="info" text="Interactive" /> <Badge type="warning" text="VR/AR Only" />

A radial menu component for XR applications that appears when a controller button is held, allowing users to select from multiple options using thumbstick input.

## Overview

The **RadialMenu** provides an intuitive menu system optimized for XR controllers. It appears at the controller's position when a button is held, displays options in a circular layout, and lets users select by pointing with the thumbstick.

::: tip Why Use RadialMenu?
RadialMenu provides a natural interaction pattern for VR/AR controllers where traditional menus don't work well. The circular layout maps perfectly to thumbstick input, making selection fast and intuitive. The menu spawns at the controller position and stays fixed in world space, preventing motion sickness from moving UI. Every interaction includes haptic feedback and the menu automatically faces the user with billboard behavior. Perfect for action wheels, quick menus, and contextual options.
:::

## Quick Start

```tsx
import { RadialMenu, RadialMenuSection } from 'r3f-xr-widgets'

const sections: RadialMenuSection[] = [
  { id: 'option1', label: 'Jump', data: { action: 'jump' } },
  { id: 'option2', label: 'Run', data: { action: 'run' } },
  { id: 'option3', label: 'Crouch', data: { action: 'crouch' } },
  { id: 'option4', label: 'Attack', data: { action: 'attack' } },
]

function Scene() {
  return (
    <RadialMenu
      hand="right"
      triggerButton="b-button"
      sections={sections}
      onSelect={(section) => {
        if (section) {
          console.log('Selected:', section.data.action)
        }
      }}
    />
  )
}
```

## Key Features

### Button Press Activation

Hold a configurable button to show the menu. The menu appears at the controller's world position when activated.

```tsx
<RadialMenu
  hand="right"
  triggerButton="b-button"  // B button activates menu
  sections={sections}
/>
```

### Thumbstick Navigation

Move the same controller's thumbstick to highlight different sections. The highlighted section is determined by the thumbstick angle.

```tsx
<RadialMenu
  sections={sections}
  deadZone={0.3}  // Thumbstick dead zone threshold
/>
```

### Selection on Release

Release the button to select the currently highlighted section. Callback fires with the selected section data.

```tsx
<RadialMenu
  sections={sections}
  onSelect={(section, index) => {
    if (section) {
      console.log('Selected section:', section.id)
      console.log('At index:', index)
    } else {
      console.log('No selection (within dead zone)')
    }
  }}
/>
```

### Billboard Effect

The menu automatically rotates to face the camera for optimal visibility.

```tsx
<RadialMenu
  sections={sections}
  billboard={true}  // Default: faces camera
/>
```

### Haptic Feedback

Controllers vibrate when the highlighted section changes, providing tactile confirmation.

```tsx
<RadialMenu
  sections={sections}
  haptic={{ value: 0.5, duration: 30 }}  // Custom haptic pulse
/>
```

### Custom Renderers

Use a render function to fully customize how sections appear.

```tsx
<RadialMenu sections={sections}>
  {(section, index, highlighted) => (
    <group>
      <Sphere args={[0.03]} scale={highlighted ? 1.5 : 1}>
        <meshStandardMaterial
          color={highlighted ? 'yellow' : 'white'}
        />
      </Sphere>
      <Text fontSize={0.02}>{section.label}</Text>
    </group>
  )}
</RadialMenu>
```

## Props

### `sections` (Required)
- **Type:** `RadialMenuSection[]`
- **Required:** Yes

Array of menu sections to display. Each section must have a unique `id`.

```tsx
interface RadialMenuSection {
  id: string          // Unique identifier
  label?: string      // Optional display label
  data?: any          // Optional user data
}
```

Example:
```tsx
const sections: RadialMenuSection[] = [
  { id: 'north', label: 'North', data: { direction: 'north' } },
  { id: 'east', label: 'East', data: { direction: 'east' } },
  { id: 'south', label: 'South', data: { direction: 'south' } },
  { id: 'west', label: 'West', data: { direction: 'west' } },
]
```

### `hand`
- **Type:** `'left' | 'right'`
- **Default:** `'right'`

Which controller hand to track for button and thumbstick input.

```tsx
<RadialMenu hand="left" sections={sections} />
```

### `triggerButton`
- **Type:** `string`
- **Default:** `'b-button'`

Controller button that activates the menu. Common values:
- `'a-button'` - A button
- `'b-button'` - B button (default)
- `'x-button'` - X button
- `'y-button'` - Y button
- `'trigger'` - Trigger button
- `'squeeze'` - Squeeze/grip button
- `'thumbstick'` - Thumbstick click

```tsx
<RadialMenu triggerButton="a-button" sections={sections} />
```

### `onSelect`
- **Type:** `(section: RadialMenuSection | null, index: number) => void`
- **Required:** No

Callback fired when the button is released. Receives the selected section (or `null` if thumbstick was in dead zone) and its index.

```tsx
<RadialMenu
  sections={sections}
  onSelect={(section, index) => {
    if (section) {
      console.log(`Selected ${section.id} at index ${index}`)
      // Perform action based on section.data
    }
  }}
/>
```

### `radius`
- **Type:** `number`
- **Default:** `0.1`

Radius of the menu circle in meters. Larger values spread sections further apart.

```tsx
<RadialMenu radius={0.15} sections={sections} />
```

### `deadZone`
- **Type:** `number`
- **Default:** `0.3`

Thumbstick dead zone threshold (0-1). The thumbstick must be pushed beyond this value to select a section. Higher values require more deliberate input.

```tsx
<RadialMenu deadZone={0.4} sections={sections} />
```

::: tip Dead Zone Best Practices
- Use `0.2-0.3` for menus with many sections (6-8+) for easy selection
- Use `0.35-0.5` for menus with few sections (3-4) to prevent accidental selection
:::

### `billboard`
- **Type:** `boolean`
- **Default:** `true`

Enable billboard effect to face the camera. Keeps the menu readable regardless of spawn orientation.

```tsx
<RadialMenu billboard={false} sections={sections} />
```

### `haptic`
- **Type:** `PulseConfig`
- **Default:** `{ value: 0.3, duration: 50 }`

Haptic feedback configuration for section changes.

```tsx
interface PulseConfig {
  value?: number     // Intensity 0.0-1.0 (default: 0.3)
  duration?: number  // Duration in ms (default: 50)
}
```

Example:
```tsx
<RadialMenu
  sections={sections}
  haptic={{ value: 0.5, duration: 80 }}  // Stronger, longer pulse
/>
```

### `children`
- **Type:** `(section: RadialMenuSection, index: number, highlighted: boolean) => ReactNode`
- **Required:** No

Custom renderer function for sections. Receives section data, index, and highlight state.

```tsx
<RadialMenu sections={sections}>
  {(section, index, highlighted) => {
    // Calculate position based on index
    const anglePerSection = (Math.PI * 2) / sections.length
    const angle = index * anglePerSection - Math.PI / 2
    const x = Math.cos(angle) * 0.12
    const y = Math.sin(angle) * 0.12

    return (
      <group position={[x, y, 0]}>
        <mesh scale={highlighted ? 1.5 : 1}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color={highlighted ? '#ffff00' : '#ffffff'} />
        </mesh>
      </group>
    )
  }}
</RadialMenu>
```

## Examples

### 4-Section Directional Menu

```tsx
const directions: RadialMenuSection[] = [
  { id: 'north', label: 'North', data: { angle: 0 } },
  { id: 'east', label: 'East', data: { angle: 90 } },
  { id: 'south', label: 'South', data: { angle: 180 } },
  { id: 'west', label: 'West', data: { angle: 270 } },
]

<RadialMenu
  hand="right"
  triggerButton="b-button"
  sections={directions}
  radius={0.12}
  onSelect={(section) => {
    if (section) {
      console.log('Moving:', section.label)
    }
  }}
/>
```

### 8-Section Color Picker

```tsx
const colors: RadialMenuSection[] = [
  { id: 'red', data: { color: '#ff0000' } },
  { id: 'orange', data: { color: '#ff7f00' } },
  { id: 'yellow', data: { color: '#ffff00' } },
  { id: 'green', data: { color: '#00ff00' } },
  { id: 'cyan', data: { color: '#00ffff' } },
  { id: 'blue', data: { color: '#0000ff' } },
  { id: 'purple', data: { color: '#8b00ff' } },
  { id: 'magenta', data: { color: '#ff00ff' } },
]

<RadialMenu
  sections={colors}
  radius={0.1}
  deadZone={0.35}
  onSelect={(section) => {
    if (section) {
      setSelectedColor(section.data.color)
    }
  }}
>
  {(section, index, highlighted) => {
    const angle = (index * Math.PI * 2) / colors.length - Math.PI / 2
    const x = Math.cos(angle) * 0.1
    const y = Math.sin(angle) * 0.1

    return (
      <group position={[x, y, 0]}>
        <Sphere args={[0.02]} scale={highlighted ? 1.6 : 1}>
          <meshStandardMaterial
            color={section.data.color}
            emissive={section.data.color}
            emissiveIntensity={highlighted ? 0.8 : 0.2}
          />
        </Sphere>
      </group>
    )
  }}
</RadialMenu>
```

### Action Wheel with Icons

```tsx
const actions: RadialMenuSection[] = [
  { id: 'jump', label: '⬆️ Jump', data: { action: 'jump' } },
  { id: 'run', label: '🏃 Run', data: { action: 'run' } },
  { id: 'crouch', label: '⬇️ Crouch', data: { action: 'crouch' } },
  { id: 'attack', label: '⚔️ Attack', data: { action: 'attack' } },
  { id: 'defend', label: '🛡️ Defend', data: { action: 'defend' } },
  { id: 'heal', label: '❤️ Heal', data: { action: 'heal' } },
]

<RadialMenu
  hand="left"
  triggerButton="a-button"
  sections={actions}
  radius={0.15}
  onSelect={(section) => {
    if (section) {
      performAction(section.data.action)
    }
  }}
>
  {(section, index, highlighted) => {
    const angle = (index * Math.PI * 2) / actions.length - Math.PI / 2
    const x = Math.cos(angle) * 0.15
    const y = Math.sin(angle) * 0.15

    return (
      <group position={[x, y, 0]}>
        <mesh scale={highlighted ? 1.5 : 1}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshStandardMaterial color={highlighted ? '#ffd43b' : '#ffffff'} />
        </mesh>
        <Text
          position={[0, -0.06, 0]}
          fontSize={0.02}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {section.label}
        </Text>
      </group>
    )
  }}
</RadialMenu>
```

### Multiple Menus on Different Buttons

```tsx
function Scene() {
  return (
    <>
      {/* Left hand A button - Actions */}
      <RadialMenu
        hand="left"
        triggerButton="a-button"
        sections={actionSections}
        onSelect={handleActionSelect}
      />

      {/* Right hand A button - Tools */}
      <RadialMenu
        hand="right"
        triggerButton="a-button"
        sections={toolSections}
        onSelect={handleToolSelect}
      />

      {/* Right hand B button - Navigation */}
      <RadialMenu
        hand="right"
        triggerButton="b-button"
        sections={navSections}
        onSelect={handleNavSelect}
      />
    </>
  )
}
```

## Best Practices

### Number of Sections

**Recommended:** Use 4-8 sections for optimal usability. This range provides enough options while keeping each section large enough to select easily.

```tsx
// Good: 6 sections, easy to distinguish
const sections = [section1, section2, section3, section4, section5, section6]
```

**Avoid:** Too many sections (10+) make individual sections too small and hard to select precisely.

```tsx
// Bad: 12 sections, too crowded
const sections = [...Array(12)].map((_, i) => ({ id: `option${i}` }))
```

### Dead Zone Configuration

**Recommended:** Adjust dead zone based on section count and desired precision.
- 4 sections: `deadZone={0.4}` - prevents accidental selection
- 6 sections: `deadZone={0.3}` - balanced
- 8+ sections: `deadZone={0.25}` - easier to reach edges

**Avoid:** Dead zone too small (under 0.2) causes accidental selections. Dead zone too large (over 0.6) makes edge sections hard to reach.

### Menu Positioning

**Recommended:** Let the menu spawn at controller position (default behavior). The world-space positioning prevents motion sickness.

**Avoid:** Attaching the menu to follow the controller while open, which can cause disorientation.

### Visual Feedback

**Recommended:** Provide clear visual distinction between highlighted and non-highlighted sections using scale, color, or emissive intensity.

```tsx
<meshStandardMaterial
  color={highlighted ? '#ffff00' : '#ffffff'}
  emissive={highlighted ? '#ffff00' : '#000000'}
  emissiveIntensity={highlighted ? 0.5 : 0}
/>
```

**Avoid:** Subtle highlighting that's hard to see, especially in bright environments.

### Button Assignment

**Recommended:** Use buttons that are easy to hold while moving the thumbstick:
- A/B buttons (face buttons) - Easy to hold and don't interfere with thumbstick
- Avoid trigger or squeeze - harder to hold while using thumbstick

```tsx
<RadialMenu triggerButton="b-button" />  // Good
<RadialMenu triggerButton="trigger" />   // Harder to use
```

## Related

- [Hover](/components/hover) - Used internally for XR hover interactions
- [vibrateOnEvent](/api/utilities#vibrateoneven) - Used for haptic feedback
- [FaceTowardsCamera](/components/face-towards-camera) - Similar billboard behavior
