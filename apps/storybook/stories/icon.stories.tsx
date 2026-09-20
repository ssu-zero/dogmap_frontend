import type { Meta, StoryObj } from "@storybook/react-vite"
import { Icon } from "@workspace/ui/components/icon"

const meta = {
  title: "Components/Icon",
  component: Icon,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const CourseEdit: Story = {
  args: { name: "editRed", className: "size-6" },
}
