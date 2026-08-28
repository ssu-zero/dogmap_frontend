import { defineMain } from "@storybook/react-vite/node"

export default defineMain({
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  async viteFinal(config) {
    const { default: tailwindcss } = await import("@tailwindcss/vite")

    config.plugins = [...(config.plugins ?? []), tailwindcss()]

    return config
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      include: ["../stories/**/*.tsx", "../../../packages/ui/src/**/*.tsx"],
    },
  },
})
