import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface DemoInfo {
  name: string
  slug: string
  path: string
  description: string
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

        demos.push({
          name: packageJson.name,
          slug: entry.name,
          path: entry.name,
          description: packageJson.description || '',
        })
      } catch (error) {
        console.warn(`Failed to read package.json for demo: ${entry.name}`, error)
      }
    }

    // Sort alphabetically by name
    return demos.sort((a, b) => a.name.localeCompare(b.name))
  }
}
