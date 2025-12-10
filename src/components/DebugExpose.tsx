import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import type { XRStore } from "@react-three/xr"

export interface DebugExposeProps {
  /** Optional XR store to expose alongside Three.js objects */
  store?: XRStore
  /** Namespace for the global variable (default: '__THREE__') */
  namespace?: string
}

/**
 * Debug component that exposes Three.js objects to the browser console.
 * Useful for debugging and inspecting the scene during development.
 *
 * Exposes: scene, gl (renderer), camera, and optionally the XR store
 */
export function DebugExpose({ store, namespace = '__THREE__' }: DebugExposeProps) {
  const { scene, gl, camera } = useThree()

  useEffect(() => {
    const debugObj: Record<string, unknown> = { scene, gl, camera }
    if (store) {
      debugObj.store = store
    }

    // @ts-ignore - intentionally adding to window for debugging
    window[namespace] = debugObj

    console.log(`[Debug] Three.js objects exposed to window.${namespace}`)
    console.log('[Debug] scene:', scene)
    if (store) {
      console.log('[Debug] XR store:', store)
      console.log(`[Debug] Try: ${namespace}.store.getState() for XR state`)
    }
    console.log(`[Debug] Try: ${namespace}.scene.children to see all objects`)

    return () => {
      // @ts-ignore
      delete window[namespace]
    }
  }, [scene, gl, camera, store, namespace])

  return null
}
