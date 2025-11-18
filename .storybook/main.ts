import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-docs"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  }
  // Local profile serving - commented out for now, see LATER.md
  // "staticDirs": [
  //   {
  //     from: '../node_modules/@webxr-input-profiles/assets/dist/profiles',
  //     to: '/profiles'
  //   }
  // ]
};
export default config;
