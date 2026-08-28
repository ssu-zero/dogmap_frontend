import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  AgreeButton,
  ChoiceButton,
  FloatingAction,
  LikeButton,
} from "@workspace/ui/components/selection"

const meta = {
  title: "Components/Selection",
  component: ChoiceButton,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ChoiceButton>
export default meta
type Story = StoryObj<typeof meta>
export const Variants: Story = {
  render: () => (
    <div className="flex w-[335px] flex-wrap gap-3">
      <ChoiceButton state="disabled">소형견</ChoiceButton>
      <ChoiceButton state="default">중형견</ChoiceButton>
      <ChoiceButton state="selected">대형견</ChoiceButton>
      <div className="w-full">
        <AgreeButton>서비스 이용약관에 동의합니다</AgreeButton>
        <AgreeButton checked>서비스 이용약관에 동의합니다</AgreeButton>
      </div>
      <FloatingAction mode="solo">현재 위치</FloatingAction>
      <FloatingAction mode="multi">코스 추가</FloatingAction>
      <LikeButton />
      <LikeButton pressed />
    </div>
  ),
}
