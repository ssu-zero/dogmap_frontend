import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Chip,
  CourseNumber,
  NumberChip,
  PawActivity,
  PawCount,
} from "@workspace/ui/components/chip"

const meta = {
  title: "Components/Chip",
  component: Chip,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Chip>
export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div className="flex max-w-[335px] flex-wrap items-center gap-2">
      <Chip>반려견 동반</Chip>
      <Chip variant="dark">실내</Chip>
      <Chip variant="red">추천</Chip>
      <Chip size="lg" paw>
        산책
      </Chip>
      <Chip size="lg" variant="selected" paw>
        산책
      </Chip>
      <PawCount count={1} />
      <PawCount count={2} />
      <PawCount count={3} />
      <NumberChip count={11} />
      <CourseNumber>1</CourseNumber>
      <PawActivity count={11} />
    </div>
  ),
}
