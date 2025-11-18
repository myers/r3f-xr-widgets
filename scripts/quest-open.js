#!/usr/bin/env node

/**
 * Quest browser opener with idempotent ADB port forwarding
 *
 * Usage: node scripts/quest-open.js <url>
 * Example: node scripts/quest-open.js http://localhost:9004/r3f-xr-widgets/3d-video/
 *
 * This script:
 * 1. Checks if ADB is available (exits with error if not)
 * 2. Checks if ADB devices are connected (exits with error if not)
 * 3. Idempotently sets up port forwarding (checks if already set up)
 * 4. Opens URL in Quest browser (launches browser if not running, or navigates existing tab)
 *
 * Works reliably after Quest reboots or on 1st/1000th run.
 */

import { spawn } from 'child_process'
import which from 'which'
import CDP from 'chrome-remote-interface'

const TARGET_URL = process.argv[2]
const CDP_PORT = 9223 // Chrome DevTools Protocol port (Quest browser default)

if (!TARGET_URL) {
  console.error('❌ Error: URL required')
  console.error('Usage: node scripts/quest-open.js <url>')
  console.error('Example: node scripts/quest-open.js http://localhost:9004/r3f-xr-widgets/3d-video/')
  process.exit(1)
}

// Parse port from URL
let port
try {
  const url = new URL(TARGET_URL)
  port = parseInt(url.port, 10)
  if (!port || isNaN(port)) {
    console.error('❌ Error: Could not parse port from URL:', TARGET_URL)
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Error: Invalid URL:', TARGET_URL)
  process.exit(1)
}

/**
 * Execute a shell command and return a promise
 */
function execCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    })

    let stdout = ''
    let stderr = ''

    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })
    }

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`))
      }
    })

    proc.on('error', reject)
  })
}

/**
 * Check if ADB is on the PATH
 */
function checkADBPath() {
  try {
    const adbPath = which.sync('adb')
    console.log(`✓ Found ADB at: ${adbPath}`)
    return true
  } catch (error) {
    console.error('❌ Error: ADB not found in PATH')
    console.error('')
    console.error('   Please install Android Platform Tools and add adb to your PATH:')
    console.error('   https://developer.android.com/tools/releases/platform-tools')
    console.error('')
    console.error('   Installation instructions:')
    console.error('   - macOS: brew install android-platform-tools')
    console.error('   - Linux: sudo apt install adb (or equivalent)')
    console.error('   - Windows: Download from the link above and add to PATH')
    console.error('')
    process.exit(1)
  }
}

/**
 * Restart ADB server if it's in a bad state
 */
async function restartADBServer() {
  console.log('⚠ ADB server appears to be in a bad state, restarting...')
  try {
    // Kill server (ignore errors - it might already be dead)
    try {
      await execCommand('adb', ['kill-server'])
    } catch (e) {
      // Ignore errors
    }

    // Start server
    await execCommand('adb', ['start-server'])
    console.log('✓ ADB server restarted successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to restart ADB server:', error.message)
    return false
  }
}

/**
 * Check if ADB devices are connected (with auto-recovery for server issues)
 */
async function checkADBDevices(retryCount = 0) {
  try {
    const output = await execCommand('adb', ['devices'])
    const lines = output.trim().split('\n').slice(1) // Skip header
    const devices = lines.filter(line => line.trim() && !line.includes('List of devices'))

    if (devices.length === 0) {
      console.error('❌ Error: No ADB devices connected')
      console.error('')
      console.error('   Please connect your Quest device via USB and enable USB debugging')
      console.error('')
      process.exit(1)
    }

    console.log(`✓ Found ${devices.length} ADB device(s)`)
    return true
  } catch (error) {
    // Check if it's a server issue (protocol fault, connection reset, etc.)
    const isServerIssue = error.message.includes('protocol fault') ||
                         error.message.includes('Connection reset') ||
                         error.message.includes('server version') ||
                         error.message.includes('cannot connect to daemon')

    if (isServerIssue && retryCount === 0) {
      // Try to recover by restarting ADB server
      const restarted = await restartADBServer()
      if (restarted) {
        // Retry once
        return await checkADBDevices(1)
      }
    }

    // Either not a server issue, or restart failed, or already retried
    console.error('❌ Error: Failed to list ADB devices:', error.message)
    console.error('')
    console.error('   Try running: adb kill-server && adb start-server')
    console.error('')
    process.exit(1)
  }
}

/**
 * Idempotently set up ADB port forwarding
 * Checks if forwarding already exists before setting up
 */
async function ensurePortForwarding(port) {
  try {
    // Check reverse forwarding (Quest -> Host for dev server)
    const reverseList = await execCommand('adb', ['reverse', '--list'])
    const reverseExists = reverseList.includes(`tcp:${port}`)

    if (reverseExists) {
      console.log(`✓ ADB reverse port forwarding already set up: Quest:${port} -> Host:${port}`)
    } else {
      await execCommand('adb', ['reverse', `tcp:${port}`, `tcp:${port}`])
      console.log(`✓ ADB reverse port forwarding set up: Quest:${port} -> Host:${port}`)
    }

    // Check forward forwarding (Host -> Quest for CDP)
    const forwardList = await execCommand('adb', ['forward', '--list'])
    const cdpExists = forwardList.includes(`tcp:${CDP_PORT}`)

    if (cdpExists) {
      console.log(`✓ ADB forward port forwarding already set up: Host:${CDP_PORT} -> Quest:chrome_devtools_remote (CDP)`)
    } else {
      await execCommand('adb', ['forward', `tcp:${CDP_PORT}`, 'localabstract:chrome_devtools_remote'])
      console.log(`✓ ADB forward port forwarding set up: Host:${CDP_PORT} -> Quest:chrome_devtools_remote (CDP)`)
    }

    return true
  } catch (error) {
    console.error('❌ Failed to set up port forwarding:', error.message)
    process.exit(1)
  }
}

/**
 * Check if Quest browser is running
 */
async function isBrowserRunning() {
  try {
    const output = await execCommand('adb', ['shell', 'ps | grep com.oculus.browser'])
    return output.includes('com.oculus.browser')
  } catch (error) {
    // grep returns non-zero exit code when no match found
    return false
  }
}

/**
 * Launch Quest browser with the target URL
 */
async function launchBrowser(url) {
  console.log('🚀 Launching Quest browser...')
  try {
    await execCommand('adb', [
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.VIEW',
      '-d',
      url,
      'com.oculus.browser'
    ])
    console.log(`✓ Quest browser launched with URL: ${url}`)
    return true
  } catch (error) {
    console.error('❌ Failed to launch Quest browser:', error.message)
    return false
  }
}

/**
 * Try to find and navigate/reload existing tab via CDP
 */
async function tryNavigateExistingTab(targetUrl) {
  try {
    const targets = await CDP.List({ port: CDP_PORT })

    // First, check if URL is already open
    const existingTab = targets.find(target =>
      target.type === 'page' && target.url === targetUrl
    )

    if (existingTab) {
      console.log(`✓ Found existing tab with URL: ${targetUrl}`)

      // Connect and reload
      const client = await CDP({ target: existingTab.id, port: CDP_PORT })
      const { Page } = client

      await Page.enable()
      await Page.reload()
      await CDP.Activate({ id: existingTab.id, port: CDP_PORT })
      await client.close()

      console.log('✓ Reloaded and activated existing tab')
      return true
    }

    // Second, look for a blank tab to navigate
    const blankTab = targets.find(target =>
      target.type === 'page' &&
      (target.url === 'about:blank' ||
       target.url === 'chrome://newtab/' ||
       target.url === 'chrome://panel-app-nav/ntp' ||  // Quest New Tab page
       target.url === '')
    )

    if (blankTab) {
      console.log('✓ Found blank tab, navigating it...')

      // Connect to the blank tab and navigate it
      const client = await CDP({ target: blankTab.id, port: CDP_PORT })
      const { Page } = client

      await Page.enable()
      await Page.navigate({ url: targetUrl })
      await Page.loadEventFired()
      await CDP.Activate({ id: blankTab.id, port: CDP_PORT })
      await client.close()

      console.log('✓ Navigated blank tab to URL')
      return true
    }

    return false
  } catch (error) {
    // CDP errors are non-fatal, we'll fallback to am start
    console.log('⚠ CDP operation failed:', error.message)
    return false
  }
}

/**
 * Open URL in Quest browser
 */
async function openInBrowser(url) {
  const browserRunning = await isBrowserRunning()

  if (!browserRunning) {
    console.log('✓ Quest browser is not running')
    return await launchBrowser(url)
  }

  console.log('✓ Quest browser is already running')

  // Try to navigate existing or blank tab via CDP first
  const navigated = await tryNavigateExistingTab(url)

  if (!navigated) {
    // Fallback to launching with am start (will open in new tab or reuse existing)
    console.log('⚠ No existing or blank tab found, opening URL...')
    return await launchBrowser(url)
  }

  return true
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n🌐 Opening ${TARGET_URL} on Quest...\n`)

  // Check prerequisites
  checkADBPath()
  await checkADBDevices()

  // Set up port forwarding (idempotent)
  await ensurePortForwarding(port)

  // Open in browser
  await openInBrowser(TARGET_URL)

  console.log('\n✅ Done!\n')
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message)
  process.exit(1)
})
