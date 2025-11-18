import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { preview } from '@vitest/browser-preview'
import react from '@vitejs/plugin-react'

// Use VITEST_PREVIEW=1 to enable manual browser connection mode for debugging
const usePreviewMode = process.env.VITEST_PREVIEW === '1'

// Use headless mode in CI or when explicitly requested
const useHeadless = process.env.CI === 'true' || process.env.VITEST_BROWSER_HEADLESS === 'true'

export default defineConfig({
  define: {
    // Inject Node environment variables into browser context
    '__DEBUG_LOGGING__': JSON.stringify(process.env.DEBUG_LOGGING || ''),
    '__DEBUG_COLORS__': JSON.stringify(process.env.DEBUG_COLORS || '0'),
  },
  plugins: [react()],
  server: {
    // Serve XR input profiles from node_modules for tests
    fs: {
      allow: ['..']
    }
  },
  test: {
    setupFiles: ['./src/test-utils/vitest.setup.ts'],
    browser: {
      enabled: true,
      // Preview mode: manual browser connection (for chrome-devtools MCP)
      // Playwright mode: automated testing (for CI and regular test runs)
      provider: usePreviewMode
        ? preview()
        : playwright({
            headless: useHeadless,
            launchOptions: {
              args: [
                '--disable-dev-shm-usage',  // Use /tmp instead of /dev/shm (critical for Docker)
                '--no-sandbox',              // Disable sandboxing (needed in containers)
                '--disable-setuid-sandbox',  // Disable setuid sandbox
                '--use-gl=swiftshader',      // Use software WebGL rendering
                '--disable-web-security',    // Disable web security (may help with WebGL)
              ]
            }
          }),
      instances: [
        {
          browser: 'chromium',
          viewport: { width: 1024, height: 768 }
        },
      ],
      // API configuration for preview mode
      api: {
        port: 63315,
        host: 'localhost',
      }
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
