import type { Meta, StoryObj } from "@storybook/react-vite"
import { TextField } from "@workspace/ui/components/text-field"

const meta = {
  title: "Components/TextField",
  component: TextField,
  parameters: { layout: "centered" },
} satisfies Meta<typeof TextField>
export default meta
type Story = StoryObj<typeof meta>
export const Variants: Story = {
  render: () => (
    <div className="flex w-[335px] flex-col gap-3">
      <TextField state="default" />
      <TextField state="writing" defaultValue="몽이" />
      <TextField state="completed" defaultValue="제로" />
    </div>
  ),
}
