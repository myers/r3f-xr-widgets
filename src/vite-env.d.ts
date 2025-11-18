/// <reference types="vite/client" />

declare module '*.json?url' {
  const src: string
  export default src
}

// Global variables injected by vitest.config.ts define
declare global {
  var __DEBUG_LOGGING__: string
  var __DEBUG_COLORS__: string
}
