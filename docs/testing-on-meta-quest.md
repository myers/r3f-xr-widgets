# Testing on Meta Quest

Quick guide for testing demos on Meta Quest headsets.

## Prerequisites

1. **Android Platform Tools** (for ADB)
   - macOS: `brew install android-platform-tools`
   - Linux: `sudo apt install adb`
   - Windows: Download from [developer.android.com](https://developer.android.com/tools/releases/platform-tools)

2. **Quest Setup**
   - Enable Developer Mode on your Quest
   - Enable USB Debugging in Quest settings
   - Connect Quest to your computer via USB

## Quick Start

Run any demo on Quest with a single command:

```bash
pnpm quest:horizon-window    # Test horizon window demo
pnpm quest:resizable-window  # Test resizable window demo
pnpm quest:video-player      # Test video player demo
pnpm quest:3d-video          # Test 3D video demo
```

These scripts automatically:

1. Find an available port
2. Start the dev server
3. Set up ADB port forwarding
4. Open the URL in Quest browser

## Manual Testing

If you need more control:

1. **Start dev server** (from demo directory):

   ```bash
   cd demos/horizon-window
   pnpm dev
   ```

2. **Open in Quest browser**:

   ```bash
   pnpm quest-open http://localhost:9002/r3f-xr-widgets/horizon-window/
   ```

## How It Works

### Port Forwarding

The scripts set up bidirectional port forwarding:

- **Reverse** (Quest → Host): Lets Quest access your dev server at `localhost`
- **Forward** (Host → Quest): Enables Chrome DevTools Protocol for tab management

### Browser Control

The `quest-open` script uses Chrome DevTools Protocol to:

- Reload existing tabs if URL is already open
- Navigate blank tabs instead of opening new ones
- Launch browser if not running

### Idempotent Setup

All scripts are idempotent - you can run them repeatedly without issues:

- Port forwarding checks before setting up
- ADB server auto-restarts if in bad state
- Works reliably after Quest reboots

## Troubleshooting

**No devices found:**

- Check USB cable connection
- Verify USB debugging is enabled on Quest
- Run `adb devices` to check connection

**Port forwarding issues:**

- Run `adb kill-server && adb start-server`
- Disconnect and reconnect Quest USB cable

**Browser won't open:**

- Ensure Quest browser is installed
- Try opening browser manually on Quest first
- Check ADB connection with `adb devices`
