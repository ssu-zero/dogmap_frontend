import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { Icon } from "@workspace/ui/components/icon"
import { cn } from "@workspace/ui/lib/utils"

const choiceVariants = cva(
  "inline-flex flex-col items-center justify-center gap-1 rounded-xl transition-colors",
  {
    variants: {
      state: {
        default: "bg-gray-50 text-gray-700",
        selected: "border border-gray-900 bg-gray-50 text-gray-900",
        disabled: "bg-gray-50 text-gray-700 opacity-40",
      },
    },
    defaultVariants: { state: "default" },
  }
)
type ChoiceButtonProps = ComponentProps<"button"> &
  VariantProps<typeof choiceVariants> & { description?: string }
function ChoiceButton({
  state,
  description,
  className,
  children,
  ...props
}: ChoiceButtonProps) {
  return (
    <button
      className={cn(
        choiceVariants({ state }),
        "min-h-18 min-w-[109px] px-3 py-2",
        className
      )}
      type="button"
      disabled={state === "disabled"}
      {...props}
    >
      {children}
      {description ? (
        <span className="type-caption-r-12">{description}</span>
      ) : null}
    </button>
  )
}

type AgreeButtonProps = ComponentProps<"button"> & { checked?: boolean }
function AgreeButton({
  checked = false,
  children,
  className,
  ...props
}: AgreeButtonProps) {
  return (
    <button
      className={cn(
        "type-body-r-16 flex w-full items-center justify-between rounded-[4px] bg-gray-50 p-3 text-left",
        className
      )}
      type="button"
      aria-pressed={checked}
      {...props}
    >
      <Icon
        name="checkLine"
        className={cn("size-6", checked && "opacity-100")}
      />
      <span className="flex-1">{children}</span>
      <span className="px-3 text-red-600">보기</span>
    </button>
  )
}

type FloatingActionProps = ComponentProps<"button"> & {
  mode?: "solo" | "multi"
}
function FloatingAction({
  mode = "solo",
  className,
  children,
  ...props
}: FloatingActionProps) {
  return (
    <button
      type="button"
      className={cn(
        "type-body-r-16 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2",
        mode === "solo"
          ? "bg-gray-600 text-gray-100 shadow-[0_0_5px_rgba(91,91,91,.4)]"
          : "bg-gray-50 text-gray-500 shadow-[0_0_5px_rgba(201,198,198,.6)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function LikeButton({
  pressed = false,
  className,
  ...props
}: ComponentProps<"button"> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "inline-flex size-[54px] items-center justify-center rounded-full border border-gray-150 bg-gray-50",
        pressed && "border-gray-100",
        className
      )}
      {...props}
    >
      <Icon name="pawFill" className="size-7" />
    </button>
  )
}

export { AgreeButton, ChoiceButton, FloatingAction, LikeButton, choiceVariants }
export type { AgreeButtonProps, ChoiceButtonProps, FloatingActionProps }
