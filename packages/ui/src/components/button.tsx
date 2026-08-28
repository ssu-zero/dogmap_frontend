import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:cursor-default",
  {
    variants: {
      variant: {
        primary:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-150 disabled:text-white",
        secondary:
          "border border-gray-150 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200",
        text: "bg-transparent text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200",
        dark: "bg-gray-900 text-white disabled:bg-gray-150 disabled:text-gray-300",
      },
      size: {
        xs: "type-body-sb-14 h-9 rounded-xl px-10",
        sm: "type-body-sb-13 h-8 rounded-lg px-3",
        md: "type-body-sb-14 h-11 rounded-lg px-4",
        lg: "type-body-sb-16 h-13 rounded-full px-8",
        full: "type-body-sb-16 h-14 w-full rounded-full px-8",
        icon: "size-11 rounded-lg",
        fab: "type-body-sb-16 h-12 rounded-full px-6 shadow-[0_0_2px_rgba(151,151,151,0.6)]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>

function Button({
  className,
  type = "button",
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 transition-colors disabled:pointer-events-none",
        buttonVariants({ variant, size }),
        className
      )}
      {...props}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
