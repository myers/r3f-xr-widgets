import type { Preview } from '@storybook/react-vite'

// Note: XR stories now provide their own Canvas via XRStoryCanvas component
// Non-XR stories can add their own decorators as needed

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;
