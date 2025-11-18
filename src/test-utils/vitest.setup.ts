/**
 * Vitest setupFiles for browser mode
 * This file runs in the browser context before tests execute
 */

// IMPORTANT: Import debug FIRST and override useColors BEFORE any other imports
// This ensures the override takes effect before any debug instances are created
import debug from 'debug'

// Override debug's useColors function to respect __DEBUG_COLORS__ global
// The debug package's browser implementation doesn't natively support disabling colors
// Note: useColors is not in the TypeScript types, but exists at runtime
const debugAny = debug as any
const originalUseColors = debugAny.useColors
debugAny.useColors = function() {
  const debugColors = (globalThis as any).__DEBUG_COLORS__ || '0'
  if (debugColors === '0') {
    return false
  }
  return originalUseColors()
}

// Read environment variables from Node side that were injected via define
const debugValue = (globalThis as any).__DEBUG_LOGGING__ || ''

// Set localStorage.debug AND explicitly enable debug namespaces
// Note: debug.enable() must be called explicitly because the debug module
// reads localStorage.debug only once at initialization, which happens before
// this setup file sets the value. Calling enable() updates the internal cache.
if (debugValue) {
  localStorage.setItem('debug', debugValue)
  debug.enable(debugValue)
  console.log('[Vitest Setup] Enabled debug logging:', debugValue)
} else {
  localStorage.removeItem('debug')
  debug.disable()
}
