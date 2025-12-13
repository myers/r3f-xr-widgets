import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { preview } from '@vitest/browser-preview'

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
    // Multi-project configuration
    // Unit tests run in Node + jsdom (fast), browser tests run in real browser (XR/WebGL)
    projects: [
      // Unit tests (fast, Node + jsdom)
      // Uses @react-three/test-renderer for UIKit component testing
      // jsdom provides DOMParser, document, etc. without Chromium overhead
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
          environment: 'jsdom',  // Provides browser APIs (DOMParser, document, etc.)
          setupFiles: [], // No browser setup needed for jsdom tests
        }
      },
      // Browser tests (XR, DOM, WebGL)
      // Uses vitest-browser-react for testing in real browser environment
      {
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
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
        }
      }
    ]
  },
})
