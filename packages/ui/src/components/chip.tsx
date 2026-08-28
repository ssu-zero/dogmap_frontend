import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "@workspace/ui/components/icon"
import { cn } from "@workspace/ui/lib/utils"

const chipVariants = cva("inline-flex items-center justify-center", {
  variants: {
    variant: {
      light: "bg-gray-50 text-gray-700",
      dark: "bg-gray-500 text-white",
      red: "bg-red-800 text-white",
      softRed: "bg-red-50 text-red-700",
      selected: "border border-red-600 bg-red-50 text-red-600",
      outline: "border border-gray-150 bg-white text-gray-700",
    },
    size: {
      sm: "type-caption-sb-12 h-6 rounded-full px-2",
      lg: "type-body-sb-14 h-10 gap-1.5 rounded-xl px-3",
    },
  },
  defaultVariants: { variant: "light", size: "sm" },
})

type ChipProps = ComponentProps<"button"> &
  VariantProps<typeof chipVariants> & {
    paw?: boolean
  }

function Chip({
  className,
  variant,
  size,
  paw = false,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      className={cn(chipVariants({ variant, size }), className)}
      type="button"
      {...props}
    >
      {paw ? <Icon name="pawFill" className="size-4" /> : null}
      {children}
    </button>
  )
}

function PawCount({
  count,
  className,
}: {
  count: 1 | 2 | 3
  className?: string
}) {
  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label={`발바닥 ${count}개`}
    >
      {Array.from({ length: count }, (_, index) => (
        <Icon key={index} name="pawFill" className="size-4" />
      ))}
    </span>
  )
}

function NumberChip({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "type-caption-sb-12 inline-flex h-6 items-center gap-1 rounded-full bg-red-600 py-1 pr-2 pl-1 text-white",
        className
      )}
    >
      <Icon name="plus" className="size-4" />
      {count}
    </span>
  )
}

function CourseNumber({ children, className }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "type-body-r-14 inline-flex size-7.5 items-center justify-center rounded-full border-2 border-white bg-red-700 text-white shadow-[0_0_5px_#e2462f]",
        className
      )}
    >
      {children}
    </span>
  )
}

function PawActivity({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="isolate flex items-center">
        <span className="type-body-sb-16 z-4 -mr-2.5 inline-flex h-6 items-center gap-0.5 rounded-full bg-red-600 py-1 pr-2 pl-1 text-red-50">
          <Icon name="plus" className="size-5" />
          {count}
        </span>
        <span className="z-3 -mr-2.5 flex size-5.5 items-center justify-center rounded-full bg-red-400">
          <Icon name="pawFill" className="size-5.5" />
        </span>
        <span className="z-2 -mr-2.5 flex size-5.5 items-center justify-center rounded-full bg-red-200">
          <Icon name="pawFill" className="size-5.5" />
        </span>
        <span className="z-1 flex size-5.5 items-center justify-center rounded-full bg-red-200">
          <Icon name="pawFill" className="size-5.5" />
        </span>
      </div>
      <span className="type-body-r-14 text-gray-500">
        {count}명이 발자국을 남겼어요!
      </span>
    </div>
  )
}

export { Chip, CourseNumber, NumberChip, PawActivity, PawCount, chipVariants }
export type { ChipProps }
