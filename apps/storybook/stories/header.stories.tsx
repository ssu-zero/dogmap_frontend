import type { Meta, StoryObj } from "@storybook/react-vite"
import { Header, PageTitle } from "@workspace/ui/components/header"

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Header>
export default meta
type Story = StoryObj<typeof meta>
export const Variants: Story = {
  render: () => (
    <div className="w-[375px] space-y-8">
      <Header title="코스 상세" onBack={() => undefined} />
      <PageTitle>반려견과 갈 곳</PageTitle>
    </div>
  ),
}
