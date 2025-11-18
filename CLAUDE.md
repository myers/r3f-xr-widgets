# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a library package (`r3f-xr-widgets`) that provides reusable XR/VR widgets for React Three Fiber applications. It's built as a dual-format library (ESM and CJS) with TypeScript support.

## Development Commands

- `pnpm dev` - Build library in watch mode for development
- `pnpm build` - Build the library for production (outputs to `dist/`)
- `pnpm typecheck` - Run TypeScript type checking without emitting files
- `pnpm demo` - Start the resizable window demo dev server with HTTPS (required for XR)
- `pnpm demo:resizable-window` - Start the resizable window demo (same as `pnpm demo`)
- `pnpm demo:landing` - Serve the demos landing page
- `pnpm demo:build` - Build demos for production

## Architecture

### Library Structure

The library exports XR-ready React components and utilities from `src/index.ts`:

**Widget Components:**
- `ResizableWindow` - Main widget container with move/resize handles and camera-facing rotation
- `HandleWithAudio` - Wrapper around `@react-three/handle` that adds positional audio feedback
- `Hover` - Helper component for XR hover interactions with haptic feedback
- `AudioEffects` - Global audio effect sources that HandleWithAudio components reference

**Utility Components** (merged from r3f-tools):
- `SplashScreen` - Full-screen overlay with Enter VR/AR buttons that hides when in session
- `GitHubBadge` - GitHub repository badge/link component for demos
- `EyeLevelGroup` - Positions children at user's eye level, captured once when entering XR

**Hooks:**
- `useXRSessionModeSupportedPolling` - Polls navigator.xr for VR/AR session support

**Utilities:**
- `vibrateOnEvent` - Triggers haptic feedback on XR controllers
- `DEFAULT_EYE_LEVEL` - Constant for default eye level (1.5m)

### Key Design Patterns

1. **Handle System Integration**: Uses `@react-three/handle` for drag/move/resize interactions. The library wraps handles with audio feedback via shared PositionalAudio refs (`handleStartAudioEffectRef`, `handleEndAudioEffectRef`).

2. **Camera-Facing Windows**: `ResizableWindow` implements auto-rotation to face the camera using:
   - `initiallyRotateTowardsCamera` - One-time rotation on mount
   - `autoRotateToCamera` - Continuous rotation (disabled while dragging)
   - Rotation is applied to an inner group, keeping the outer group's position stable

3. **Handle Positioning**:
   - Move handle at bottom: positioned at `[0, (-baseScale / 2 - 0.03) * currentScale, 0]`
   - Resize handle at top-right: positioned at `[(baseScale * aspectRatio / 2) + offset, (baseScale / 2) + offset, 0]`
   - Both handles maintain constant visual size by dividing by `currentScale` (e.g., `scale / currentScale`)
   - Positions are relative to content dimensions to ensure correct placement regardless of aspect ratio
   - Both use `targetRef="from-context"` to affect the parent HandleTarget

4. **XR Haptic Feedback**: The `vibrateOnEvent` utility checks if the pointer event comes from an XR controller and triggers gamepad haptic pulse.

5. **Asset Handling**: 3D models (`.glb`) and audio files (`.mp3`) are imported with `?url` suffix for Vite asset handling, then used with `useGLTF` and `PositionalAudio`.

### Demo Applications

The demos (`demos/` directory) showcase the library components:

**Demos Landing Page** (`demos/index.html`):
- Overview of all available demos
- Links to individual demo applications
- Run with `pnpm demo:landing`

**Resizable Window Demo** (`demos/resizable-window/`):
- Showcases ResizableWindow component
- XR store setup with `createXRStore` from `@react-three/xr`
- SplashScreen for VR/AR entry
- HTTPS dev server (required for WebXR)
- UIKit integration for 2D content inside windows
- Camera positioned at eye level (1.5m)
- Run with `pnpm demo` or `pnpm demo:resizable-window`

## Build System

- **Vite** for both library and demo builds
- **vite-plugin-dts** generates TypeScript declarations
- Library externals: react, react-dom, three, @react-three/fiber, @react-three/drei, @react-three/xr, @react-three/handle
- Assets (`.glb`, `.mp3`) are included in the build and re-exported via `./assets/*` export path

## TypeScript Configuration

- Strict mode enabled with all recommended checks
- Target ES2020 with DOM types
- Output to `dist/` with declaration maps
- Source in `src/`, excludes `demo/`
- to get a change to the library to work, you need to cd ~/c/standalone/r3f-xr-widgets; pnpm build; cd demo; rm -r node_modules ; pnpm install ; pnpm dev
- after you finish at set of edits, before you check to see if something is working: run a typecheck
- Pretend /tmp does not exist.  ~/c/standalone should be your working area.  Always use jpeg screenshots.
- This project uses threejs to render things, snapshots and click in the chrome mcp are probably useless in most cases
- before you finish be sure to test your changes with chrome mcp using screenshots to validate
- If you need to read about uikit look at ~/c/uikit-workspaces/uikit
- If you need to read about react-xr look at ~/c/uikit-workspaces/xr
- when changing code, see if there is a .test.tsx for that component.  Use that test to see if the change causes a regression before testing in the browser with chrome devtools mcp
- NEVER EVER EVER set a `<color attach="background" ... />` when using an XRLayer.  The layer will not be visible.
- when you are looking test failures remember you can use pnpm test <filename>
- no one is using this library yet, we don't need to worry about breaking changes
