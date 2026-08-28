import type { Meta, StoryObj } from "@storybook/react-vite"
import { BottomNavigation } from "@workspace/ui/components/navigation"

const meta = {
  title: "Components/Navigation",
  component: BottomNavigation,
  parameters: { layout: "centered" },
} satisfies Meta<typeof BottomNavigation>
export default meta
type Story = StoryObj<typeof meta>
export const Variants: Story = {
  args: { value: "home" },
  render: () => (
    <div className="w-[375px]">
      <BottomNavigation value="home" />
      <BottomNavigation value="course" />
    </div>
  ),
}
