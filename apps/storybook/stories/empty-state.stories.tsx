import type { Meta, StoryObj } from "@storybook/react-vite"
import { EmptyState } from "@workspace/ui/components/empty-state"

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: { layout: "centered" },
} satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
