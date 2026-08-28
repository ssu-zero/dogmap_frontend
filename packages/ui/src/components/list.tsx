import type { ComponentProps, ReactNode } from "react"

import { Chip, PawActivity, PawCount } from "@workspace/ui/components/chip"
import { Icon } from "@workspace/ui/components/icon"
import { cn } from "@workspace/ui/lib/utils"

type ListRowProps = ComponentProps<"button"> & {
  label: string
  description?: string
  leading?: ReactNode
  trailing?: ReactNode
  showArrow?: boolean
}
function ListRow({
  label,
  description,
  leading,
  trailing,
  showArrow = true,
  className,
  ...props
}: ListRowProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 px-1 py-2 text-left",
        className
      )}
      {...props}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="type-body-r-16 block truncate">{label}</span>
        {description ? (
          <span className="type-body-r-14 block truncate text-gray-400">
            {description}
          </span>
        ) : null}
      </span>
      {trailing}
      {showArrow ? <Icon name="arrowRight" className="size-6" /> : null}
    </button>
  )
}

function CreateListRow({
  children = "새 목록 만들기",
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & { children?: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "type-body-r-16 flex w-full items-center justify-between rounded-xl bg-[rgba(235,236,236,.4)] px-5 py-4 text-gray-700",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <Icon name="plus" className="size-6" />
    </button>
  )
}

type TimeBadgeProps = { period: string; time: string; className?: string }
function TimeBadge({ period, time, className }: TimeBadgeProps) {
  return (
    <span
      className={cn(
        "type-body-r-14 inline-flex items-center gap-1 rounded-xl bg-gray-50 px-4 py-2 text-gray-700 shadow-[0_0_2px_var(--color-gray-100)]",
        className
      )}
    >
      <span>{period}</span>
      <span>{time}</span>
    </span>
  )
}

type TimeListProps = {
  start: TimeBadgeProps
  end: TimeBadgeProps
  className?: string
}
function TimeList({ start, end, className }: TimeListProps) {
  return (
    <section
      className={cn(
        "w-full max-w-[335px] rounded-xl bg-[rgba(235,236,236,.4)] px-5 pt-1 pb-4",
        className
      )}
    >
      <header className="border-b border-gray-150 py-3">
        <h3 className="type-head-sb-18 text-gray-600">시간</h3>
      </header>
      <div className="space-y-2 pt-3">
        <div className="flex items-center justify-between">
          <span className="type-body-sb-14 text-gray-400">시작 시간</span>
          <TimeBadge {...start} className="w-25 justify-center" />
        </div>
        <div className="flex items-center justify-between">
          <span className="type-body-sb-14 text-gray-400">종료 시간</span>
          <TimeBadge {...end} className="w-25 justify-center" />
        </div>
      </div>
    </section>
  )
}

type CourseListItemProps = {
  index: number
  title: string
  category: string
  paws?: 1 | 2 | 3
  time?: TimeBadgeProps
  className?: string
}
function CourseListItem({
  index,
  title,
  category,
  paws = 1,
  time,
  className,
}: CourseListItemProps) {
  return (
    <article
      className={cn(
        "flex gap-3 rounded-xl bg-white p-4 shadow-[0_1px_8px_rgba(0,0,0,.06)]",
        className
      )}
    >
      <span className="type-body-r-14 flex size-7.5 shrink-0 items-center justify-center rounded-full bg-red-700 text-white">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="type-body-sb-16 truncate">{title}</p>
            <p className="type-body-r-14 text-gray-400">{category}</p>
          </div>
          {time ? <TimeBadge {...time} /> : null}
        </div>
        <PawCount count={paws} className="mt-2 text-red-600" />
      </div>
    </article>
  )
}

type CourseCardProps = {
  title: string
  hours: number
  spots: number
  variant?: "course" | "community-y" | "community-n"
  createdAt?: string
  activityCount?: number
  className?: string
}
function CourseCard({
  title,
  hours,
  spots,
  variant = "course",
  createdAt = "2026.08.19",
  activityCount = 11,
  className,
}: CourseCardProps) {
  return (
    <article
      className={cn(
        "w-full max-w-[335px] rounded-xl border border-gray-100 bg-white px-3 py-4",
        variant === "community-y" ? "space-y-4" : "space-y-3",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="type-head-sb-18 text-gray-900">{title}</h3>
          <div className="type-body-r-13 flex items-center gap-3 text-gray-400">
            <span>
              산책시간{" "}
              <strong className="type-body-sb-13 text-red-600">
                {hours}시간
              </strong>
            </span>
            <span className="h-4 border-l border-gray-150" />
            <span>
              스팟{" "}
              <strong className="type-body-sb-13 text-red-600">
                {spots}곳
              </strong>
            </span>
          </div>
        </div>
        <Icon name="bookmarkFill" className="size-6" />
      </div>
      {variant === "course" ? (
        <div className="type-body-r-13 flex items-center gap-2 text-gray-200">
          <Icon name="bone" className="size-5.5" />
          생성일 {createdAt}
        </div>
      ) : null}
      {variant === "community-y" ? <PawActivity count={activityCount} /> : null}
      {variant === "community-n" ? (
        <div className="type-body-r-14 flex items-center gap-2 text-gray-500">
          <Icon name="bone" className="size-5.5" />
          아직 발자국을 남긴 친구가 없어요
        </div>
      ) : null}
    </article>
  )
}

type SpotListItemProps = {
  title: string
  category: string
  chip?: string
  tone?: "light" | "red"
  image?: ReactNode
  className?: string
}
function SpotListItem({
  title,
  category,
  chip,
  tone = "light",
  image,
  className,
}: SpotListItemProps) {
  return (
    <article className={cn("flex gap-3 py-3", className)}>
      {image ? (
        <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {image}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="type-body-sb-16 truncate">{title}</h3>
          {chip ? (
            <Chip variant={tone === "red" ? "red" : "light"}>{chip}</Chip>
          ) : null}
        </div>
        <p className="type-body-r-14 mt-1 text-gray-400">{category}</p>
      </div>
    </article>
  )
}

type TimelineSpotProps = {
  title?: string
  time?: string
  chip?: string
  variant?:
    | "dark-default"
    | "dark-empty"
    | "dark-edit"
    | "light-default"
    | "light-empty"
  review?: string
  className?: string
}
function TimelineSpot({
  title = "키키카페 익산점",
  time = "오전 10 : 00",
  chip = "반려견 동반",
  variant = "light-default",
  review,
  className,
}: TimelineSpotProps) {
  const dark = variant.startsWith("dark")
  const empty = variant.endsWith("empty")
  const edit = variant === "dark-edit"
  const surface = dark
    ? "border-gray-600 bg-gray-800 text-gray-150"
    : "border-gray-100 bg-gray-50 text-gray-600"

  return (
    <article className={cn("flex w-full max-w-[335px] gap-4", className)}>
      <div className="flex w-3 shrink-0 flex-col items-center">
        <span
          className={cn(
            "mt-1.5 size-3 rounded-full border-2",
            dark ? "border-gray-400 bg-gray-200" : "border-red-300 bg-red-600"
          )}
        />
        <span
          className={cn(
            "min-h-17 flex-1 border-l",
            dark ? "border-gray-500" : "border-red-400"
          )}
        />
      </div>
      <div className="min-w-0 flex-1 space-y-2 pb-3">
        <p className="type-body-sb-13 text-gray-400">{time}</p>
        <div
          className={cn(
            "flex min-h-14 items-center gap-3 rounded-[20px] border px-5 py-3",
            surface,
            empty && "flex-col items-start"
          )}
        >
          {empty ? (
            <>
              <Chip variant={dark ? "red" : "softRed"}>{chip}</Chip>
              <p className="type-body-r-13 text-gray-400">
                뛰지 않고 쉬어가면서 걷는게 좋아요!
              </p>
            </>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="type-body-sb-16 truncate">{title}</p>
              <div className="mt-2 flex items-center gap-3">
                <Chip variant={dark ? "dark" : "softRed"}>{chip}</Chip>
                <span
                  className={cn(
                    "type-body-r-13",
                    dark ? "text-gray-400" : "text-gray-500"
                  )}
                >
                  첫 방문
                </span>
              </div>
            </div>
          )}
          {edit ? (
            <button
              type="button"
              aria-label="스팟 제거"
              className="flex size-11 items-center justify-center rounded-lg border border-gray-50 bg-gray-700"
            >
              <Icon name="close" className="size-6" />
            </button>
          ) : null}
          {!edit && !empty ? (
            <Icon name="arrowRight" className="size-6" />
          ) : null}
        </div>
        {dark && !empty && review ? (
          <div className="space-y-1 px-3">
            <span className="type-body-r-13 rounded bg-gray-700 px-1 text-gray-400">
              ㄴ 내가 남겼던 후기
            </span>
            <p className="type-body-r-13 truncate text-gray-400">{review}</p>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export {
  CourseCard,
  CourseListItem,
  CreateListRow,
  ListRow,
  SpotListItem,
  TimeBadge,
  TimelineSpot,
  TimeList,
}
export type {
  CourseCardProps,
  CourseListItemProps,
  ListRowProps,
  SpotListItemProps,
  TimeBadgeProps,
  TimelineSpotProps,
  TimeListProps,
}
