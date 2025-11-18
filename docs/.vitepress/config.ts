import { defineConfig } from 'vitepress'
import typedocSidebar from '../api/typedoc-sidebar.json'

// Fix typedoc sidebar links (remove /docs prefix)
const apiSidebar = typedocSidebar.map((section: any) => ({
  ...section,
  items: section.items.map((item: any) => ({
    ...item,
    link: item.link.replace('/docs', '')
  }))
}))

export default defineConfig({
  title: 'r3f-xr-widgets',
  description: 'Reusable XR/VR widgets and utilities for React Three Fiber',
  base: '/r3f-xr-widgets/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/' },
      { text: 'API', link: '/api/' },
      { text: 'Demos', link: '/demos' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' }
          ]
        },
        {
          text: 'Examples',
          items: [
            { text: 'Basic Window', link: '/guide/examples/basic-window' },
            { text: 'XR Session Setup', link: '/guide/examples/xr-session' }
          ]
        }
      ],
      '/components/': [
        {
          text: 'Featured Components',
          items: [
            { text: 'ResizableWindow', link: '/components/resizable-window' },
            { text: 'SplashScreen', link: '/components/splash-screen' }
          ]
        },
        {
          text: 'Utility Components',
          items: [
            { text: 'EyeLevelGroup', link: '/components/eye-level-group' },
            { text: 'Hover', link: '/components/hover' },
            { text: 'AudioEffects', link: '/components/audio-effects' },
            { text: 'GitHubBadge', link: '/components/github-badge' }
          ]
        }
      ],
      '/api/': apiSidebar
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/myers/r3f-xr-widgets' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Myers Carpenter'
    }
  }
})
