#!/usr/bin/env node

/**
 * Development server launcher for demos
 *
 * Usage: node scripts/start-dev-server.js <demo-name>
 * Example: node scripts/start-dev-server.js video-player
 *
 * This script:
 * 1. Finds a free port in the 9000-9999 range
 * 2. Starts the Vite dev server for the specified demo
 * 3. Calls quest-open.js to open the URL on Quest (if ADB available)
 */

import { spawn } from 'child_process'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import detect from 'detect-port'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEMO_NAME = process.argv[2]

// Demo port mappings and URL paths
const DEMO_CONFIG = {
  'widgets': { port: 9001, path: '/r3f-xr-widgets/widgets/' },
  'windows': { port: 9002, path: '/r3f-xr-widgets/windows/' },
  'video-player': { port: 9003, path: '/r3f-xr-widgets/video-player/' },
  '3d-video': { port: 9004, path: '/r3f-xr-widgets/3d-video/' },
  'control-panel-test': { port: 9005, path: '/r3f-xr-widgets/control-panel-test/' },
}

if (!DEMO_NAME) {
  console.error('❌ Error: Demo name required')
  console.error('Usage: node scripts/start-dev-server.js <demo-name>')
  console.error('Available demos:', Object.keys(DEMO_CONFIG).join(', '))
  process.exit(1)
}

if (!DEMO_CONFIG[DEMO_NAME]) {
  console.error(`❌ Error: Unknown demo "${DEMO_NAME}"`)
  console.error('Available demos:', Object.keys(DEMO_CONFIG).join(', '))
  process.exit(1)
}

const DEMO_DIR = resolve(__dirname, '..', 'demos', DEMO_NAME)
const PREFERRED_PORT = DEMO_CONFIG[DEMO_NAME].port
const URL_PATH = DEMO_CONFIG[DEMO_NAME].path

/**
 * Find a free port
 */
async function findFreePort(preferredPort) {
  try {
    const port = await detect(preferredPort)
    if (port === preferredPort) {
      console.log(`✓ Port ${port} is available`)
      return port
    } else {
      console.log(`⚠ Port ${preferredPort} is busy, using ${port} instead`)
      return port
    }
  } catch (error) {
    console.error('❌ Error detecting port:', error.message)
    process.exit(1)
  }
}

/**
 * Start the Vite dev server
 */
function startDevServer(port) {
  console.log(`\n🚀 Starting dev server for "${DEMO_NAME}" on port ${port}...\n`)

  const proc = spawn('pnpm', ['dev'], {
    cwd: DEMO_DIR,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: port.toString()
    }
  })

  proc.on('error', (error) => {
    console.error('❌ Failed to start dev server:', error.message)
    process.exit(1)
  })

  return proc
}

/**
 * Open the URL on Quest (spawn quest-open.js in background)
 */
function openOnQuest(port) {
  // Wait a bit for dev server to start, then call quest-open.js
  setTimeout(() => {
    const url = `http://localhost:${port}${URL_PATH}`
    console.log(`\n🌐 Opening ${url} on Quest...`)

    const questOpen = spawn('node', [resolve(__dirname, 'quest-open.js'), url], {
      stdio: 'inherit',
      shell: true
    })

    questOpen.on('error', (error) => {
      console.log('⚠ Failed to open on Quest:', error.message)
      console.log('   (You can manually run: pnpm quest-open', url + ')')
    })
  }, 3000) // 3 second delay for dev server to start
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n🎮 Quest Development Mode: ${DEMO_NAME}\n`)

  // Find free port
  const port = await findFreePort(PREFERRED_PORT)

  // Start dev server
  const devServer = startDevServer(port)

  // Open on Quest (background task, non-blocking)
  openOnQuest(port)

  // Print access URLs
  console.log('\n📱 Access URLs:')
  console.log(`   Local:   http://localhost:${port}${URL_PATH}`)
  console.log(`   Quest:   http://localhost:${port}${URL_PATH}`)
  console.log('\n💡 Tips:')
  console.log('   - The Quest browser should open automatically')
  console.log('   - Press Ctrl+C to stop\n')

  // Handle cleanup on exit
  const cleanup = () => {
    console.log('\n👋 Stopping dev server...')
    devServer.kill()
    process.exit(0)
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message)
  process.exit(1)
})
