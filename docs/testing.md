# XR Testing Guide

This guide covers how to write automated tests for React-XR components using Vitest Browser Mode.

## Table of Contents

- [Introduction](#introduction)
- [Quick Start](#quick-start)
- [Core Components & APIs](#core-components--apis)
- [Writing Your First Test](#writing-your-first-test)
- [Common Patterns](#common-patterns)
- [Cleanup & Isolation](#cleanup--isolation)
- [Running Tests](#running-tests)
- [Debugging Tips](#debugging-tips)

---

## Introduction

This library provides a comprehensive test framework for automated XR interaction testing in real browser environments. The framework enables you to:

- **Test XR components in real browsers** using Vitest Browser Mode
- **Emulate XR sessions** without physical hardware
- **Control virtual XR controllers** programmatically (point, click, press buttons, move thumbsticks)
- **Run tests in CI/CD** headlessly or with browser UI for debugging

The framework is built on:

- **Vitest** - Fast, modern test framework with browser mode
- **vitest-browser-react** - React rendering utilities for browser tests
- **@react-three/xr** - XR primitives with emulator support (IWER)
- **Custom test utilities** - ControllerHelper, XRTestCanvas, enterVRSession

---

## Quick Start

Here's a minimal example testing button presses with the `useXRButtons` hook:

```typescript
// src/hooks/useXRButtons.test.tsx
import { describe, it, expect, afterEach } from 'vitest'
import { render } from 'vitest-browser-react'
import { XRTestCanvas } from '../test-utils/xr-test-setup'
import { enterVRSession, cleanupXRSession } from '../test-utils/vitest-helpers'

// Test scene component defined inline
function UseXRButtonsTestScene({ requirePointerOn = false }) {
  const handleButtonPress = (buttonName: string) => {
    const tracker = document.getElementById('button-tracker')
    if (tracker) {
      const current = tracker.dataset[buttonName] || '0'
      tracker.dataset[buttonName] = String(parseInt(current) + 1)
    }
  }

  const { targetRef, onPointerEnter, onPointerLeave } = useXRButtons({
    onAPress: () => handleButtonPress('a'),
    requirePointerOn
  })

  return (
    <>
      <div id="button-tracker" style={{ display: 'none' }} data-a="0" />
      <XRTestCanvas>
        <group position={[0, 1.5, -3]} ref={targetRef}>
          {/* Your test content here */}
        </group>
      </XRTestCanvas>
    </>
  )
}

describe('useXRButtons Hook', () => {
  afterEach(async () => {
    await cleanupXRSession()
  })

  it('should detect A button press', async () => {
    // Render component
    render(<UseXRButtonsTestScene requirePointerOn={false} />)

    // Enter VR session and get controllers
    const { controllers } = await enterVRSession({
      container: document.body,
      timeout: 10000
    })

    // Press A button
    await controllers.pressButton('a-button', 'right', 3)

    // Assert event fired
    const tracker = document.getElementById('button-tracker')
    await expect.poll(() => tracker?.dataset.a, { timeout: 3000 }).toBe('1')
  })
})
```

---

## Core Components & APIs

### XRTestCanvas

Wrapper component that sets up the complete XR test environment for automated Vitest tests.

**Usage:**

```typescript
export function MyTestScene() {
  return (
    <XRTestCanvas>
      <MyXRComponent />
    </XRTestCanvas>
  )
}
```

**What it provides:**

- XR store with Meta Quest 3 emulator configuration
- Canvas with camera at eye level (1.6m)
- Lighting (ambient + directional)
- EnterXRButton component
- Scene and store references attached to canvas element (`__scene`, `__xrStore`)

**Internal configuration:**

```typescript
{
  emulate: {
    type: 'metaQuest3',
    inject: true,
    primaryInputMode: 'controller',
  },
  offerSession: false,
}
```

---

### enterVRSession()

High-level helper that enters a VR session and returns ready-to-use utilities.

**Signature:**

```typescript
async function enterVRSession(options: {
  container: HTMLElement  // Usually document.body
  timeout?: number        // default: 5000ms
}): Promise<{
  scene: Scene
  controllers: ControllerHelper
}>
```

**What it does:**

1. Finds the canvas element in the container
2. Waits for XRStore and Scene to be available (attached by XRTestCanvas)
3. Finds and waits for "Enter VR" button to be enabled
4. Clicks the button to enter VR session
5. Waits for XR session to start
6. Creates a ControllerHelper (already tracking right controller)
7. Waits 3 frames for R3F render loop to start (critical for useFrame hooks)
8. Returns scene and controllers

**Example:**

```typescript
const { scene, controllers } = await enterVRSession({
  container: document.body,
  timeout: 10000
})
```

---

### ControllerHelper

Class for controlling emulated XR controllers programmatically.

#### Creation

The `enterVRSession()` helper returns a ready-to-use `ControllerHelper`, so you typically don't need to create one manually.

#### Methods

##### `pressButton(button, hand?, holdFrames?)`

Simulates pressing and releasing a controller button.

```typescript
await controllers.pressButton('a-button', 'right', 3)
```

**Common button names:**

- `'trigger'` - Main trigger button
- `'a-button'` - A button (right controller)
- `'b-button'` - B button (right controller)
- `'x-button'` - X button (left controller)
- `'y-button'` - Y button (left controller)
- `'squeeze'` - Grip/squeeze button
- `'thumbstick'` - Thumbstick press

**Parameters:**

- `button: string` - Button identifier
- `hand?: 'left' | 'right'` - Which controller (default: 'right')
- `holdFrames?: number` - XR frames to hold button (default: 1)

##### `moveThumbstick(hand?, x, y, holdMs?)`

Move the thumbstick to a specific position and hold for specified duration.

```typescript
// Move right (X axis positive)
await controllers.moveThumbstick('right', 0.8, 0)

// Move up (Y axis negative)
await controllers.moveThumbstick('right', 0, -0.8, 100)

// Move left (X axis negative)
await controllers.moveThumbstick('right', -0.8, 0, 100)

// Move down (Y axis positive)
await controllers.moveThumbstick('right', 0, 0.8, 100)
```

**Parameters:**

- `hand?: 'left' | 'right'` - Which controller (default: 'right')
- `x: number` - X axis value (-1 to 1, left to right)
- `y: number` - Y axis value (-1 to 1, down to up, **note: up is negative**)
- `holdMs?: number` - Milliseconds to hold position (default: 100)

##### `clickAt(options)`

Points at a named object and presses the trigger button (most common operation for UI).

```typescript
await controllers.clickAt({
  name: 'my-button',     // three.js Name of the target object
  hand: 'right',         // Optional: 'left' or 'right' (default: 'right')
  holdFrames: 1          // Optional: frames to hold trigger (default: 1)
})
```

**How it works:**

- Finds the object by name in the scene
- Calculates center of object's bounding box
- Rotates controller to point at that position
- Waits 10 frames for XR system to process
- Presses trigger button
- Waits 1 more frame for React components to process click

##### `point(options)`

Points a controller at a named object by rotating it (position unchanged).

```typescript
await controllers.point({
  name: 'my-object',
  hand: 'right'  // Optional
})
```

##### `reset(hand?)`

Resets a controller to its default position.

```typescript
await controllers.reset('right')
```

**Default positions:**

- Right controller: `[0.25, 1.5, -0.4]`
- Left controller: `[-0.25, 1.5, -0.4]`

##### `getControllerPosition(hand?)`

Returns the current controller position as a Three.js Vector3.

```typescript
const position = controllers.getControllerPosition('right')
console.log(position) // Vector3 { x: 0.25, y: 1.5, z: -0.4 }
```

##### `waitFrames(count)`

Waits for a specified number of XR frames to process. Useful for ensuring state updates.

```typescript
await controllers.waitFrames(3)
```

---

### cleanupXRSession()

Helper function to clean up XR session after tests. Use this in `afterEach()` to ensure proper cleanup between tests.

**Signature:**

```typescript
async function cleanupXRSession(): Promise<void>
```

**Usage:**

```typescript
import { cleanupXRSession } from '../test-utils/vitest-helpers'

describe('My XR Tests', () => {
  afterEach(async () => {
    await cleanupXRSession()
  })

  it('test 1', async () => { /* ... */ })
  it('test 2', async () => { /* ... */ })
})
```

**What it does:**

- Ends any active XR session
- Ensures clean XR state between test runs

---

### findObjectInScene()

Helper function to find a named object in the Three.js scene hierarchy.

**Signature:**

```typescript
function findObjectInScene(
  scene: THREE.Scene,
  name: string
): THREE.Object3D | undefined
```

**Usage:**

```typescript
import { findObjectInScene } from '../test-utils/ControllerHelper'

// Find object by name
const button = findObjectInScene(scene, 'my-button')

// Wait for object to exist in scene
await expect.poll(
  () => findObjectInScene(scene, 'my-button'),
  { timeout: 5000 }
).toBeDefined()
```

**What it does:**

- Traverses the scene hierarchy
- Searches for an object with matching `name` property
- Returns the first matching object or `undefined`
- Used internally by `ControllerHelper.clickAt()` and `ControllerHelper.point()`

---

## Writing Your First Test

### Step 1: Create a Test Scene Component

Create a test scene component using `XRTestCanvas` in your test file:

```typescript
// src/hooks/useXRButtons.test.tsx
import { XRTestCanvas } from '../test-utils/xr-test-setup'
import { useXRButtons } from './useXRButtons'
import { Container, Text } from '@react-three/uikit'

function UseXRButtonsTestScene({ requirePointerOn = true }) {
  const handleButtonPress = (buttonName: string) => {
    // Update DOM for test assertions
    const tracker = document.getElementById('button-tracker')
    if (tracker) {
      const current = tracker.dataset[buttonName] || '0'
      tracker.dataset[buttonName] = String(parseInt(current) + 1)
    }
  }

  const { targetRef, onPointerEnter, onPointerLeave } = useXRButtons({
    onAPress: () => handleButtonPress('a'),
    onBPress: () => handleButtonPress('b'),
    requirePointerOn
  })

  return (
    <>
      {/* Hidden tracker for test assertions */}
      <div
        id="button-tracker"
        style={{ display: 'none' }}
        data-a="0"
        data-b="0"
      />

      <XRTestCanvas>
        <group position={[0, 1.5, -3]} ref={targetRef}>
          <Container
            pixelSize={0.010}
            padding={32}
            backgroundColor="#1a1a1a"
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
          >
            <Text fontSize={32} color="white">
              Test Scene
            </Text>
          </Container>
        </group>
      </XRTestCanvas>
    </>
  )
}
```

### Step 2: Write Vitest Tests

In the same `.test.tsx` file, add your test cases:

```typescript
// src/hooks/useXRButtons.test.tsx (continued)
import { describe, it, expect, afterEach } from 'vitest'
import { render } from 'vitest-browser-react'
import { enterVRSession, cleanupXRSession } from '../test-utils/vitest-helpers'

describe('useXRButtons Hook', () => {
  afterEach(async () => {
    await cleanupXRSession()
  })

  it('should detect A button press', async () => {
    render(<UseXRButtonsTestScene requirePointerOn={false} />)

    const { controllers } = await enterVRSession({
      container: document.body,
      timeout: 10000
    })

    await controllers.pressButton('a-button', 'right', 3)

    const tracker = document.getElementById('button-tracker')
    await expect.poll(() => tracker?.dataset.a, { timeout: 3000 }).toBe('1')
  })
})
```

### Step 3: Name Your Objects

For objects to be targetable by `controllers.clickAt()` or `controllers.point()`, they must have a `name` prop:

```typescript
// For Three.js primitives
<mesh name="my-clickable-object">
  <boxGeometry />
  <meshStandardMaterial />
</mesh>

// For UIKit components
<Button name="my-button">
  <Text>Click Me</Text>
</Button>
```

> **Critical:** Without the `name` prop, `ControllerHelper` cannot find your objects!

---

## Common Patterns

### Pattern: Event Tracking with DOM Elements

Since Three.js state doesn't easily expose to test assertions, use hidden DOM elements to track events:

```typescript
export function MyComponent() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <>
      {/* Hidden tracker for tests */}
      <div
        id="my-tracker"
        style={{ display: 'none' }}
        data-click-count={clickCount}
      />

      <XRTestCanvas>
        <mesh
          name="clickable-object"
          onClick={() => {
            const newCount = clickCount + 1
            setClickCount(newCount)

            // Update tracker
            const tracker = document.getElementById('my-tracker')
            if (tracker) {
              tracker.dataset.clickCount = String(newCount)
            }
          }}
        >
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </XRTestCanvas>
    </>
  )
}
```

**In your test:**

```typescript
it('tracks clicks', async () => {
  render(<MyComponent />)

  const { controllers } = await enterVRSession({ container: document.body })

  await controllers.clickAt({ name: 'clickable-object' })

  const tracker = document.getElementById('my-tracker')
  await expect.poll(() => tracker?.dataset.clickCount).toBe('1')
})
```

### Pattern: Testing Button Presses

```typescript
it('should detect A button press', async () => {
  render(<UseXRButtonsTestScene requirePointerOn={false} />)

  const { controllers } = await enterVRSession({ container: document.body })

  // Press button (button name, hand, hold frames)
  await controllers.pressButton('a-button', 'right', 3)

  // Poll for result
  const tracker = document.getElementById('button-tracker')
  await expect.poll(() => tracker?.dataset.a, { timeout: 3000 }).toBe('1')
})
```

### Pattern: Testing Thumbstick Movement

```typescript
it('should detect thumbstick right', async () => {
  render(<UseXRButtonsTestScene requirePointerOn={false} />)

  const { controllers } = await enterVRSession({ container: document.body })

  // Move thumbstick (hand, x, y, hold ms)
  await controllers.moveThumbstick('right', 0.8, 0, 100)

  const tracker = document.getElementById('button-tracker')
  await expect.poll(() => tracker?.dataset.thumbstickright).toBe('1')
})
```

### Pattern: Testing Pointer Awareness

```typescript
it('should not fire when pointer is off target', async () => {
  render(<UseXRButtonsTestScene requirePointerOn={true} />)

  const { controllers } = await enterVRSession({ container: document.body })

  // Move controller away from target
  const emulator = controllers['store'].getState().emulator
  const controller = emulator?.controllers.right
  if (controller) {
    controller.position.set(2, 1.5, -2)
    controller.quaternion.y = 0.707  // Point away
    controller.quaternion.w = 0.707
  }
  await controllers.waitFrames(2)

  // Press button while NOT pointing
  await controllers.pressButton('a-button', 'right', 3)
  await new Promise(resolve => setTimeout(resolve, 500))

  // Verify button was NOT pressed
  const tracker = document.getElementById('button-tracker')
  expect(tracker?.dataset.a).toBe('0')
})
```

### Pattern: Testing UI Button Clicks

```typescript
it('should click UI buttons', async () => {
  render(<XRButtonTestScene />)

  const { scene, controllers } = await enterVRSession({ container: document.body })

  // Wait for button to exist in scene
  await expect.poll(
    () => findObjectInScene(scene, 'button-1'),
    { timeout: 5000 }
  ).toBeDefined()

  // Click button by name
  await controllers.clickAt({ name: 'button-1' })

  // Assert clicked
  const tracker = document.getElementById('xr-event-tracker')
  await expect.poll(() => tracker?.dataset.button1).toBe('clicked')
})
```

### Pattern: Testing Multiple Objects

```typescript
it('should click all 9 buttons', async () => {
  render(<XRButtonTestScene />)

  const { controllers } = await enterVRSession({ container: document.body })

  for (let i = 1; i <= 9; i++) {
    await controllers.clickAt({ name: `button-${i}` })

    const tracker = document.getElementById('xr-event-tracker')
    await expect.poll(
      () => tracker?.dataset[`button${i}`]
    ).toBe('clicked')
  }
})
```

---

## Cleanup & Isolation

### Test-Level Cleanup

Use `afterEach` with the `cleanupXRSession` helper to ensure clean state between tests:

```typescript
import { cleanupXRSession } from '../test-utils/vitest-helpers'

describe('My XR Component', () => {
  afterEach(async () => {
    await cleanupXRSession()
  })

  it('test 1', async () => { /* ... */ })
  it('test 2', async () => { /* ... */ })
})
```

### Automatic Cleanup

The `XRTestCanvas` component uses the `useXRStore` hook, which automatically calls `store.cleanupEmulator()` on unmount. This prevents:

- "InvalidStateError: XR Emulator already injected"
- "Context Lost" WebGL errors
- State pollution between test runs

---

## Running Tests

### Locally

Run all tests in headless mode:

```bash
pnpm test
```

Run tests with Vitest UI for debugging:

```bash
pnpm test:ui
```

Run tests with visible browser (headed mode):

```bash
pnpm test:headed
```

Run specific test file:

```bash
pnpm test src/hooks/useXRButtons.test.tsx
```

Run tests matching a pattern:

```bash
pnpm test --grep "button press"
```

Control headless mode:

```bash
# Run with visible browser
pnpm test:headed

# Or use environment variables
VITEST_BROWSER_HEADLESS=false pnpm test
CI=false pnpm test
```

### Preview Mode

Preview mode allows you to connect to a running browser instance manually, which is useful for debugging with tools like Chrome DevTools MCP.

**Enable preview mode:**

```bash
VITEST_PREVIEW=1 pnpm test
```

**What it does:**

- Starts Vitest in preview mode
- Opens a browser connection endpoint
- Waits for you to connect manually (e.g., via chrome-devtools MCP)
- Runs tests in the connected browser
- Keeps browser open for inspection

**Use with chrome-devtools MCP:**

1. Set `VITEST_PREVIEW=1 pnpm test`
2. Connect chrome-devtools MCP to the preview URL
3. Tests run in the MCP-controlled browser
4. Take screenshots, inspect console, debug interactively

### In CI

Tests run in headless mode by default, which is perfect for CI/CD:

```yaml
- name: Install browsers
  run: pnpm exec playwright install --with-deps chromium

- name: Run tests
  run: pnpm test
```

### Test Output

- **Success:** Exit code 0, summary of passed tests
- **Failure:** Exit code 1, detailed error messages, screenshots/artifacts in `test-results/`

---

## Debugging Tips

### Common Issues

#### "Object not found: my-object"

**Problem:** The object doesn't have a `name` prop or isn't in the scene yet.

**Solutions:**

1. Add `name` prop to your object:

   ```typescript
   <mesh name="my-object">
   ```

2. Wait for object to exist:

   ```typescript
   await expect.poll(
     () => findObjectInScene(scene, 'my-object'),
     { timeout: 5000 }
   ).toBeDefined()
   ```

3. Check the error message - ControllerHelper lists all named objects when it can't find your target.

#### "Cannot read properties of null (reading 'inputSource')"

**Problem:** Controller isn't tracked yet.

**Solution:** Use `enterVRSession()` which handles this automatically:

```typescript
const { controllers } = await enterVRSession({ container: document.body })
```

Or manually wait:

```typescript
await controllers.waitForControllerTracking('right')
```

#### "InvalidStateError: XR Emulator already injected"

**Problem:** Previous test didn't clean up properly.

**Solution:** Ensure you have cleanup in `afterEach`:

```typescript
import { cleanupXRSession } from '../test-utils/vitest-helpers'

afterEach(async () => {
  await cleanupXRSession()
})
```

### Using expect.poll()

For async assertions, always use `expect.poll()`:

```typescript
// ❌ BAD - won't work for async state
expect(tracker.dataset.count).toBe('1')

// ✅ GOOD - polls until condition is true or timeout
await expect.poll(
  () => tracker?.dataset.count,
  { timeout: 3000 }
).toBe('1')
```

### Debug Logging

The test framework supports debug logging via environment variables to help troubleshoot issues.

**Enable debug logging:**

```bash
# Enable all debug logs
DEBUG_LOGGING=* pnpm test

# Enable specific namespaces
DEBUG_LOGGING=r3f-xr-widgets:* pnpm test
DEBUG_LOGGING=r3f-xr-widgets:test:controller pnpm test

# Disable color output (useful in CI)
DEBUG_COLORS=0 DEBUG_LOGGING=* pnpm test
```

**Debug namespaces:**

- `r3f-xr-widgets:test:controller` - ControllerHelper operations
- `r3f-xr-widgets:test:session` - XR session management
- `r3f-xr-widgets:*` - All library debug logs

**Example output:**

```
r3f-xr-widgets:test:controller Pointing at object: button-1 +0ms
r3f-xr-widgets:test:controller Controller position: (0.25, 1.5, -0.4) +5ms
r3f-xr-widgets:test:controller Clicking trigger button +10ms
```

### Using the Debug Package in Your Code

The project uses the [`debug`](https://github.com/debug-js/debug) package for structured logging. You can add debug logging to your own components and tests:

**1. Import and create a debug logger:**

```typescript
import createDebug from 'debug'

const debug = createDebug('r3f-xr-widgets:my-component')
```

**2. Use it in your code:**

```typescript
export function MyComponent() {
  debug('Component mounted')

  const handleClick = () => {
    debug('Button clicked', { value: 42 })
  }

  return <button onClick={handleClick}>Click Me</button>
}
```

**3. Enable your namespace:**

```bash
DEBUG_LOGGING=r3f-xr-widgets:my-component pnpm test
# Or enable all r3f-xr-widgets logs
DEBUG_LOGGING=r3f-xr-widgets:* pnpm test
```

**Namespace conventions:**

- Use `r3f-xr-widgets:` prefix for all project logs
- Structure: `r3f-xr-widgets:category:subcategory`
- Examples:
  - `r3f-xr-widgets:component:my-button`
  - `r3f-xr-widgets:hook:my-hook`
  - `r3f-xr-widgets:test:my-test`

**Benefits:**

- Logs are disabled by default (zero runtime cost in production)
- Enable only what you need during debugging

---

## Next Steps

- Review existing test examples:
  - `src/hooks/useXRButtons.test.tsx` - Button and thumbstick tests
  - `src/components/XRButtonTest.test.tsx` - UI button clicking tests
- Write tests for your XR components
- Run tests locally: `pnpm test`
- Ensure tests pass before merging PRs

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [@react-three/xr Documentation](https://github.com/pmndrs/xr)
- [debug - Logging utility](https://github.com/debug-js/debug)
