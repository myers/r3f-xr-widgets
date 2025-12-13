# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a library package (`r3f-xr-widgets`) that provides reusable XR/VR widgets for React Three Fiber applications. It's built as a dual-format library (ESM and CJS) with TypeScript support.

## Development Commands

- `pnpm dev` - Build library in watch mode for development
- `pnpm build` - Build the library for production (outputs to `dist/`)
- `pnpm typecheck` - Run TypeScript type checking without emitting files

### Running Demos

To run a demo, cd into its directory and run `pnpm dev`:

```bash
cd demos/video-player && pnpm dev
```

Available demos:
- `demos/resizable-window/` - Port 9000
- `demos/horizon-window/` - Port 9001
- `demos/video-player/` - Port 9003
- `demos/3d-video/` - Port 9004
- `demos/cubemap-skybox/` - Port 9005

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

The demos (`demos/` directory) showcase the library components. Run demos by cd'ing into the demo directory and running `pnpm dev`.

**Resizable Window Demo** (`demos/resizable-window/`):
- Showcases ResizableWindow component
- XR store setup with `createXRStore` from `@react-three/xr`
- SplashScreen for VR/AR entry
- UIKit integration for 2D content inside windows
- Camera positioned at eye level (1.5m)

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

## Quest Hardware Testing

Use the global `quest-dev` and `cdp-cli` tools for Quest development.

### Workflow

1. **Start demo dev server** (in one terminal):
   ```bash
   cd demos/video-player && pnpm dev
   ```

2. **Open on Quest** (in another terminal):
   ```bash
   quest-dev open http://localhost:9003/r3f-xr-widgets/video-player/
   ```

3. **Control Quest browser**:
   ```bash
   cdp-cli tabs                              # List pages
   cdp-cli click "Video" "#enter-vr-btn" -g  # Click VR button (needs -g for user gesture)
   cdp-cli console "Video" --all             # View console
   cdp-cli go "Video" reload                 # Reload page
   ```

4. **Take XR screenshot**:
   ```bash
   quest-dev screenshot screenshots/test.jpg
   ```

### Port Reference
| Demo | Port | URL Path |
|------|------|----------|
| resizable-window | 9000 | /r3f-xr-widgets/resizable-window/ |
| horizon-window | 9001 | /r3f-xr-widgets/horizon-window/ |
| video-player | 9003 | /r3f-xr-widgets/video-player/ |
| 3d-video | 9004 | /r3f-xr-widgets/3d-video/ |
| cubemap-skybox | 9005 | /r3f-xr-widgets/cubemap-skybox/ |

### Notes
- `quest-dev open` sets up ADB port forwarding automatically
- Use `-g` flag with `cdp-cli click` for WebXR session requests
- `quest-dev screenshot` captures the Quest display (works in XR mode)
- `cdp-cli screenshot` only captures the 2D browser view
- chrome-devtools MCP cannot control the Quest browser - you MUST use cdp-cli
- only stop running servers and other background tasks by using your tools to manage tasks.  do no use lsof and kill.
- it is critical that you run vite on the same port or you get a security dialog that a human has to approve of on the quest

## pnpm Patch Workflow

**IMPORTANT:** Never edit files directly in `node_modules/`. Those changes won't persist and Vite's bundler won't pick them up. Use the pnpm patch workflow instead:

1. `pnpm patch <package>@<version>` - Creates a temp directory with the package source
2. Edit files in that temp directory (path shown in output)
3. `pnpm patch-commit <path>` - Generates/updates the patch file in `patches/`
4. `pnpm install --force` - Applies the patch to node_modules

Example:
```bash
pnpm patch @pmndrs/xr@6.6.27
# Output: You can now edit the package at: /path/to/.pnpm_patches/@pmndrs/xr@6.6.27
# Edit files in that directory...
pnpm patch-commit /path/to/.pnpm_patches/@pmndrs/xr@6.6.27
pnpm install --force
```

The patch file is stored in `patches/` and referenced in `package.json` under `patchedDependencies`. Use the `pnpm-patch` skill for guided help.
- Please don't edit files in the 'patches/', use the pnpm patch workflow to make changes.


## Testing

There are two environments to test in:

1. **Desktop**: Use the chrome-devtools MCP. Do not use `cdp-cli` for desktop testing.

2. **Quest hardware**: Use `quest-dev` and `cdp-cli` commands. See "Quest Hardware Testing" section above.
   - This environment can be flaky and require human intervention
   - Make sure code is working on desktop before testing on Quest
   - All screenshots should be saved in the workspace root / screenshots
   - Please leave console.log statements until after code review
- <XRLayer> has a fallback that is used with xr layers are not supported
