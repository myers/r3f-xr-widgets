import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface DemoInfo {
  name: string
  slug: string
  path: string
  description: string
  dependencies: string[]
  keyFeatures: string[]
}

export default {
  load(): DemoInfo[] {
    const demosDir = join(__dirname, '..', 'demos')
    const demos: DemoInfo[] = []

    // Read all directories in demos/
    const entries = readdirSync(demosDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const demoPath = join(demosDir, entry.name)
      const packageJsonPath = join(demoPath, 'package.json')

      // Skip if no package.json
      if (!existsSync(packageJsonPath)) continue

      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

        // Extract key dependencies to highlight
        const deps = packageJson.dependencies || {}
        const keyDeps = Object.keys(deps).filter(dep =>
          dep.startsWith('@react-three/') || dep === 'r3f-xr-widgets'
        )

        // Determine key features based on dependencies
        const features: string[] = []
        if (deps['@react-three/uikit']) features.push('UIKit Integration')
        if (deps['@react-three/handle']) features.push('Handle System')
        if (deps['@react-spring/three']) features.push('Animations')
        if (packageJson.name.includes('video')) features.push('Video Player')
        if (packageJson.name.includes('3d')) features.push('3D Environments')
        if (packageJson.name.includes('window')) features.push('Resizable Windows')

        demos.push({
          name: formatDemoName(packageJson.name),
          slug: entry.name,
          path: entry.name,
          description: packageJson.description || '',
          dependencies: keyDeps,
          keyFeatures: features
        })
      } catch (error) {
        console.warn(`Failed to read package.json for demo: ${entry.name}`, error)
      }
    }

    // Sort alphabetically by name
    return demos.sort((a, b) => a.name.localeCompare(b.name))
  }
}

function formatDemoName(packageName: string): string {
  // Remove common prefixes and format nicely
  return packageName
    .replace('r3f-xr-widgets-', '')
    .replace('-demo', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
