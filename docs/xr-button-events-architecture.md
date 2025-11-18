# XR Button Events Architecture

## Overview

### Goal
Create a generic, reusable XR button event system that works beyond video players. This system will:
- Call callback functions when XR buttons are pressed ('onAPress', 'onBPress', 'onXPress', 'onYPress')
- Provide a clean, React-idiomatic API for handling XR button inputs
- Move control logic out of player components into dedicated control components

### Why
Current implementation tightly couples button handling with video player logic. By creating a generic event system:
- Components become more reusable
- Separation of concerns (input handling vs. business logic)
- Easier to test without VR hardware
- Other XR apps can use the same pattern

## How XR Button Input Works

### XR Controller Buttons
XR controllers (like Quest controllers) have multiple buttons:
- **Trigger**: Primary pointer interaction (index finger)
- **A/X Button**: Right/left controller face buttons (thumb)
- **B/Y Button**: Right/left controller face buttons (thumb)
- **Thumbstick**: Analog 2-axis input

### Key Insight: Buttons ≠ Click Events
**Important**: Unlike mouse buttons, XR gamepad buttons (A, B, X, Y) do NOT trigger click/pointer events. Only the trigger button triggers standard pointer events.

To handle A/B/X/Y buttons:
1. Access the controller's gamepad state
2. Poll button state in `useFrame` loop
3. Track previous state to detect press/release transitions

```typescript
// Example of button polling
useFrame(() => {
  const gamepad = controller.inputSource.gamepad

  // Check if B button just pressed (wasn't pressed before, is pressed now)
  if (gamepad?.['b-button']?.state === 'pressed' && !previousState) {
    // Button was just pressed!
  }
})
```

### Raycasting and Pointer Events
`@react-three/xr` provides raycasting automatically:
- XR controller rays hit 3D objects in the scene
- Standard pointer events fire: `onPointerEnter`, `onPointerLeave`, `onClick`, etc.
- These events work for detecting WHICH object the user is pointing at

### The Pattern: Gating Button Presses
**Correct pattern**: Use pointer events to gate button polling

```typescript
// Track if controller ray is hitting target
const [isPointerOnTarget, setIsPointerOnTarget] = useState(false)

// Poll buttons in useFrame, but only act if pointing at target
useFrame(() => {
  if (!isPointerOnTarget) return // Gate: only process if pointing at target

  const gamepad = controller.inputSource.gamepad
  if (gamepad?.['b-button']?.state === 'pressed' && !buttonDown) {
    // B button pressed WHILE pointing at target
    handleButtonPress()
  }
})

// Wire up pointer detection
<mesh
  onPointerEnter={() => setIsPointerOnTarget(true)}
  onPointerLeave={() => setIsPointerOnTarget(false)}
/>
```

## Proposed Architecture

### useXRButtonEvents Hook

**Purpose**: Generic hook that monitors XR controller buttons and dispatches events on a target object.

**API Design**:
```typescript
interface UseXRButtonEventsOptions {
  // Which buttons to monitor
  buttons?: ('a' | 'b' | 'x' | 'y')[]

  // Which controller hand
  hand?: 'left' | 'right' | 'both'

  // Callback functions for button presses
  onAPress?: () => void
  onBPress?: () => void
  onXPress?: () => void
  onYPress?: () => void

  // Analog inputs
  onThumbstickMove?: (x: number, y: number, hand: XRHandedness) => void

  enabled?: boolean
}

function useXRButtonEvents(
  targetRef: RefObject<Object3D>,
  options: UseXRButtonEventsOptions
): {
  // Event handlers to spread on target mesh
  onPointerEnter: () => void
  onPointerLeave: () => void
  isPointerOnTarget: boolean
}
```

**What it does**:
1. Tracks `onPointerEnter`/`onPointerLeave` internally to know if pointing at target
2. Polls controller button state in `useFrame`
3. When button pressed WHILE pointing at target:
   - Calls callback function (e.g., `onBPress?.()`)
4. Returns event handlers for consumer to spread onto their mesh

### Component Responsibilities

#### Players (EquirectPlayer, QuadVideoPlayer)
**Responsibility**: Wire up button events and handle video-specific logic

```typescript
function EquirectPlayer({ videoUrl, title }) {
  const video = useMemo(() => createVideoElement(videoUrl), [videoUrl])
  const videoSurfaceRef = useRef<Object3D>(null)

  // Wire up generic button events
  const eventHandlers = useXRButtonEvents(videoSurfaceRef, {
    onAPress: () => {
      // A button: play/pause
      video.paused ? video.play() : video.pause()
    },
    onBPress: () => {
      // B button: toggle controls visibility
      toggleControlsVisibility()
    },
    onThumbstickMove: (x, y) => {
      if (Math.abs(x) > 0.5) {
        video.currentTime += x > 0 ? 10 : -10
      }
    }
  })

  return (
    <group>
      <mesh ref={videoSurfaceRef} {...eventHandlers}>
        {/* Video rendering */}
      </mesh>
      <ControlPanelAutoFade
        video={video}
      />
    </group>
  )
}
```

**What players do**:
- Create video element
- Wire up `useXRButtonEvents` with video-specific actions (play/pause, seek)
- Pass refs to child components
- Minimal state management

**What players don't do**:
- ❌ Manage control panel visibility (handled via callbacks)
- ❌ Track fade timers

#### ControlPanelAutoFade
**Responsibility**: All visibility and fade logic

```typescript
function ControlPanelAutoFade({
  video,
  fadeDelay = 3000
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [userRequestedHidden, setUserRequestedHidden] = useState(false)

  // Toggle controls visibility (called by parent via callback)
  const toggleVisibility = useCallback(() => {
    if (animatedOpacity.value > 0.1) {
      // Currently visible → hide immediately
      setIsVisible(false)
      setUserRequestedHidden(true)
    } else {
      // Currently hidden/fading → show and reset timer
      setIsVisible(true)
      setUserRequestedHidden(false)
    }
  }, [animatedOpacity])

  // Auto-fade logic (existing)
  // Hover logic (existing)
  // Animation logic (existing)

  return { toggleVisibility }
}
```

**What ControlPanel does**:
- ✅ All visibility state management
- ✅ All fade timing logic
- ✅ Toggle behavior via exposed callback
- ✅ Hover detection on controls themselves

**What ControlPanel doesn't do**:
- ❌ Direct XR controller polling
- ❌ Video playback control
- ❌ Listen to XR button events (handled by parent)

## Video Controls Behavior Rules

### B Button Toggle Behavior
When user points at video and presses B:

- **If controls visible** (`opacity > 0.1`):
  - Hide immediately (no fade out)
  - Set `userRequestedHidden = true`
  - Prevent auto-show until user toggles again

- **If controls hidden or fading** (`opacity ≤ 0.1`):
  - Show immediately (fade in to full opacity)
  - Set `userRequestedHidden = false`
  - Start normal auto-fade timer

### Auto-Fade Timing
- **Default**: 3 seconds (`fadeDelay` prop)
- **When fade starts**: Video is playing + no hover + not user-hidden
- **When fade resets**: Hover, pause, user toggles to visible, any pointer interaction during fade

### Hover Behavior
When pointer enters control panel:
- Resets fade timer
- Prevents fade while hovering
- Shows controls if hidden/fading

### Play/Pause Behavior
- **Pause**: Controls stay visible, fade timer stops
- **Play**: Starts fade timer (unless hovering or user-hidden)

### Interaction During Fade
If user interacts with controls while fading:
- Restores full opacity immediately
- Resets fade timer
- Continues normal fade cycle

### A Button Behavior
- **Function**: Toggle play/pause video
- **No direct effect on controls**: Control visibility follows auto-fade rules

### Click on Video When Controls Hidden
When `opacity ≤ 0`:
- ControlPanel renders `null`
- Pointer events pass through to video mesh
- A button on video works normally (play/pause)

### State Transitions

```
┌─────────────┐
│   VISIBLE   │ ◄──────────────────┐
│  (opacity=1)│                    │
└──────┬──────┘                    │
       │                           │
       │ Video plays + 3s          │ Pause
       │ (no hover, no user-hide)  │ OR Hover
       │                           │ OR B button
       ↓                           │
┌─────────────┐                    │
│   FADING    │                    │
│ (0<opacity<1)│───────────────────┘
└──────┬──────┘
       │
       │ Fade complete
       │ (opacity → 0)
       ↓
┌─────────────┐
│   HIDDEN    │ ◄──────────────┐
│  (opacity=0)│                │
│ render null │                │ B button
└──────┬──────┘                │ (while visible)
       │                       │
       │ B button              │
       │ OR Pause              │
       │ OR Hover              │
       └───────────────────────┘
```

### Additional Rules
1. **Initial state**: Controls start visible
2. **Video ended**: Treated same as pause (controls stay visible)
3. **Always visible mode**: `alwaysVisible` prop bypasses all auto-fade
4. **Configurable timing**: `fadeDelay` prop controls fade delay
5. **Visibility callback**: `onVisibilityChange` prop notifies parent of changes

## Implementation Steps

### Phase 1: Create Hook
1. Create `src/hooks/useXRButtonEvents.ts`
2. Implement pointer tracking (enter/leave)
3. Implement button polling in useFrame (gated by pointer)
4. Implement event dispatching on target object
5. Add optional direct callbacks
6. Add thumbstick support
7. Add tests (see Test Harness Requirements)

### Phase 2: Update ControlPanelAutoFade
1. Expose `toggleVisibility` callback via ref or return value
2. Implement toggle logic:
   - Check `animatedOpacity.value` to determine current state
   - If visible: hide immediately, set `userRequestedHidden`
   - If hidden/fading: show and reset timer
3. Remove `forceVisible` prop
4. Consolidate all fade timing to use single `fadeDelay` prop

### Phase 3: Update EquirectPlayer
1. Remove all button state variables:
   - `buttonADown`, `buttonBDown`
   - `forceControlsVisible`, `forceVisibleTimeoutRef`
2. Remove timer effect for forceVisible
3. Create `videoSurfaceRef` for XRLayer or containing mesh
4. Use `useXRButtonEvents(videoSurfaceRef, { ... })`
   - Wire up A button → play/pause
   - Enable B button (ControlPanel will listen)
   - Keep or move thumbstick seek logic
5. Spread event handlers onto video surface mesh
6. Pass `videoSurfaceRef` to ControlPanelAutoFade

### Phase 4: Update QuadVideoPlayer
1. Check current implementation
2. Apply similar pattern if needed
3. May need to refactor `useVideoXRControls` or deprecate

### Phase 5: Documentation
1. Update CLAUDE.md with new patterns
2. Create example usage documentation
3. Add JSDoc comments to hook

### Phase 6: Testing
See Test Harness Requirements below

## Test Harness Requirements

### Challenge
XR button testing requires VR hardware, which makes rapid iteration difficult.

### Test Strategy

#### 1. Simulated XR Input (Keyboard Mapping)
Create a test utility that maps keyboard keys to XR buttons by calling callbacks directly:
- `KeyA` → calls `onAPress` callback
- `KeyB` → calls `onBPress` callback
- `MouseEnter` → pointer on target
- `MouseLeave` → pointer off target

```typescript
// Test utility - callbacks are called directly when testing
function useXRButtonEventsTest(targetRef, options) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'a') {
        options.onAPress?.()
      }
      if (e.key === 'b') {
        options.onBPress?.()
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [options])
}
```

#### 2. Mock XR Controller State
Create mock `XRInputSourceState` objects for testing:

```typescript
const mockController = {
  inputSource: {
    gamepad: {
      'a-button': { state: 'pressed' },
      'b-button': { state: 'default' },
      axes: [0, 0, 0, 0]
    }
  }
}
```

#### 3. Visual Debug Overlay
Add on-screen debug overlay showing:
- Current pointer target
- Button states
- Control panel visibility state
- Fade timer countdown

```typescript
<Html>
  <div style={{ position: 'fixed', top: 10, left: 10 }}>
    <div>Pointing at: {pointerTarget}</div>
    <div>A: {aButtonState} B: {bButtonState}</div>
    <div>Controls: {visibility} (opacity: {opacity})</div>
    <div>Timer: {fadeTimer}ms</div>
  </div>
</Html>
```

#### 4. Unit Tests
Test individual pieces in isolation:
- Button state tracking (pressed → not pressed transitions)
- Pointer gating logic (button only fires when pointing at target)
- Event dispatching
- Control visibility state machine

#### 5. Integration Tests
Test full flow in demo:
- Point at video, press A → video plays/pauses
- Point at video, press B → controls toggle
- Point away, press buttons → nothing happens
- Hover controls → prevents fade
- Play video → controls fade after 3s

#### 6. Test Demo
Create dedicated test demo (`demos/xr-button-test/`):
- Large colored meshes for easy targeting
- Keyboard fallback for all XR inputs
- Visual feedback for all events
- State display overlay

### Testing Workflow
1. Develop with keyboard simulation for rapid iteration
2. Add visual debug overlay to verify state
3. Test with XR emulator (if available)
4. Final verification with actual VR hardware

### Test Cases to Cover
- ✅ B button only works when pointing at video
- ✅ B button toggles controls on → off
- ✅ B button toggles controls off → on
- ✅ Controls fade after 3s when playing
- ✅ Hover prevents fade
- ✅ Hover during fade restores opacity
- ✅ Pause keeps controls visible
- ✅ User-hidden stays hidden even on pause
- ✅ Click video when controls hidden → plays/pauses
- ✅ Thumbstick seeks video
- ✅ Multiple button presses don't cause issues

## Open Questions

1. **Thumbstick handling**: Should thumbstick be part of `useXRButtonEvents` or separate hook?
2. **Event bubbling**: Should events bubble up the scene graph?
3. **Multiple listeners**: How to handle multiple components listening to same button on same object?
4. **Controller handedness**: Should we support "either hand" option?
5. **Trigger button**: Should trigger also be handled by this hook?
6. **Test infrastructure**: Where should test utilities live? (`src/test-utils/`?)

## References

- Current implementation: `src/hooks/useVideoXRControls.ts`
- Current player: `src/components/EquirectPlayer.tsx`
- Current controls: `src/components/ControlPanelAutoFade.tsx`
- XR hooks: `@react-three/xr` package
- Pointer events: `@pmndrs/pointer-events` package
