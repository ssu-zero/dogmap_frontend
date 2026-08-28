import type { Meta, StoryObj } from "@storybook/react-vite"

import { Button } from "@workspace/ui/components/button"

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div className="flex w-[335px] flex-col gap-3">
      <Button size="xs">동의하고 시작하기</Button>
      <Button variant="primary" size="full">
        다음
      </Button>
      <Button variant="dark" size="full">
        다음
      </Button>
      <Button size="full" disabled>
        다음
      </Button>
      <Button size="fab">코스 만들기</Button>
    </div>
  ),
}
