/**
 * Configuration for XR tests to use local assets instead of CDN
 */

// Path to locally installed WebXR Input Profiles assets
// This ensures tests don't hit the CDN and work offline
//
// In the browser environment, we need to construct the full URL dynamically
// because the test server's origin may vary (localhost with different ports)
export const LOCAL_XR_ASSET_PATH =
  typeof window !== 'undefined'
    ? `${window.location.origin}/node_modules/@webxr-input-profiles/assets/dist/profiles/`
    : '/node_modules/@webxr-input-profiles/assets/dist/profiles/'
