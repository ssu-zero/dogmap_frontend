import type { ComponentProps } from "react"

import { Icon } from "@workspace/ui/components/icon"
import { cn } from "@workspace/ui/lib/utils"

type HeaderProps = ComponentProps<"header"> & {
  title?: string
  onBack?: () => void
  trailing?: React.ReactNode
}

function Header({ title, onBack, trailing, className, ...props }: HeaderProps) {
  return (
    <header
      className={cn("flex h-14 items-center justify-between px-5", className)}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-3">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="뒤로 가기">
            <Icon name="arrowLeft" className="size-6" />
          </button>
        ) : null}
        {title ? <h1 className="type-head-sb-18 truncate">{title}</h1> : null}
      </div>
      {trailing}
    </header>
  )
}

function PageTitle({ children, className, ...props }: ComponentProps<"h2">) {
  return (
    <h2 className={cn("type-head-sb-24 text-gray-800", className)} {...props}>
      {children}
    </h2>
  )
}

export { Header, PageTitle }
export type { HeaderProps }
