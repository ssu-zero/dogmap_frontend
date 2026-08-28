import type { Preview } from "@storybook/react-vite"

import "@workspace/ui/globals.css"

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "canvas",
      values: [{ name: "canvas", value: "#f8f8f8" }],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[375px] max-w-full bg-white p-5">
        <Story />
      </div>
    ),
  ],
}

export default preview
