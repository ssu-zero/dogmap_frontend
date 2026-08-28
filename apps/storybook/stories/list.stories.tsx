import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  CourseCard,
  CreateListRow,
  ListRow,
  TimeBadge,
  TimelineSpot,
  TimeList,
} from "@workspace/ui/components/list"

const meta = {
  title: "Components/List",
  component: ListRow,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ListRow>
export default meta
type Story = StoryObj<typeof meta>
export const Variants: Story = {
  args: { label: "내가 만든 코스" },
  render: () => (
    <div className="flex w-[335px] flex-col gap-4">
      <ListRow label="내가 만든 코스" />
      <CreateListRow />
      <TimeBadge period="오후" time="01 : 00" />
      <TimeList
        start={{ period: "오후", time: "01 : 00" }}
        end={{ period: "오후", time: "03 : 00" }}
      />
      <CourseCard title="제로와 함께 걷는 오후" hours={2} spots={3} />
      <CourseCard
        title="동네 산책 모임"
        hours={1}
        spots={2}
        variant="community-y"
      />
      <CourseCard
        title="새 산책 모임"
        hours={1}
        spots={2}
        variant="community-n"
      />
      <div className="bg-gray-900 p-4">
        <TimelineSpot
          variant="dark-default"
          review="제로랑 같이 갔는데 직원분이 너무 친절했어요"
        />
        <TimelineSpot variant="dark-empty" />
        <TimelineSpot variant="dark-edit" />
      </div>
      <TimelineSpot variant="light-default" />
      <TimelineSpot variant="light-empty" />
    </div>
  ),
}
