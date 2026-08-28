import type { Meta, StoryObj } from "@storybook/react-vite"
import { Loading, LoadingSteps } from "@workspace/ui/components/loading"

const meta = {
  title: "Components/Loading",
  component: LoadingSteps,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LoadingSteps>
export default meta
type Story = StoryObj<typeof meta>
export const Variants: Story = {
  args: { steps: ["past", "current", "upcoming"] },
  render: () => (
    <div className="space-y-5">
      <Loading state="default" />
      <Loading state="ing" />
      <Loading state="past" />
      <LoadingSteps steps={["upcoming", "upcoming", "upcoming"]} />
      <LoadingSteps steps={["past", "current", "upcoming"]} />
      <LoadingSteps steps={["past", "past", "past"]} />
    </div>
  ),
}
