import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

type ButtonProps = React.ComponentProps<"button">

function Button({ className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200",
        className
      )}
      {...props}
    />
  )
}

export { Button }
