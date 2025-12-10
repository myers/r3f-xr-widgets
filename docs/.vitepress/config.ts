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
          text: 'Window Components',
          items: [
            { text: 'HorizonWindow', link: '/api/functions/HorizonWindow' },
            { text: 'ResizableWindow', link: '/api/functions/ResizableWindow' }
          ]
        },
        {
          text: 'Video Players',
          items: [
            { text: 'EquirectPlayer', link: '/api/functions/EquirectPlayer' },
            { text: 'QuadVideoPlayer', link: '/api/functions/QuadVideoPlayer' }
          ]
        },
        {
          text: 'XR Utilities',
          items: [
            { text: 'SplashScreen', link: '/api/functions/SplashScreen' },
            { text: 'EnterXRButton', link: '/api/functions/EnterXRButton' },
            { text: 'EyeLevelGroup', link: '/api/functions/EyeLevelGroup' }
          ]
        },
        {
          text: 'UI Components',
          items: [
            { text: 'Hover', link: '/api/functions/Hover' },
            { text: 'AudioEffects', link: '/api/functions/AudioEffects' },
            { text: 'GitHubBadge', link: '/api/functions/GitHubBadge' }
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
