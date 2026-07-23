import type { ComponentProps } from "react"

import { cn } from "@workspace/ui/lib/utils"

type ButtonVariant = "primary" | "secondary" | "text"
type ButtonSize = "sm" | "md" | "lg" | "icon"

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-150 disabled:text-gray-300",
  secondary:
    "border border-gray-150 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200",
  text: "bg-transparent text-gray-900 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200",
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-lg px-3 type-body-sb-13",
  md: "h-11 rounded-lg px-4 type-body-sb-14",
  lg: "h-16 rounded-lg px-6 type-body-sb-16",
  icon: "size-11 rounded-lg",
}

function Button({
  className,
  type = "button",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 transition-colors disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  )
}

export { Button }
export type { ButtonProps, ButtonSize, ButtonVariant }
