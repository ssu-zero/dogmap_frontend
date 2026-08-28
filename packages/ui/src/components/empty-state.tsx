import type { ComponentProps } from "react"

import { cn } from "@workspace/ui/lib/utils"

const emptyCourseImage = new URL(
  "../assets/images/empty-course.png",
  import.meta.url
).href

type EmptyStateProps = Omit<ComponentProps<"section">, "title"> & {
  title?: string
  description?: string
}

/** Empty course state from the mobile course list. */
function EmptyState({
  title = "아직 내가 만든 코스가 없어요",
  description = "제로와의 첫 산책 코스를 만들어보세요",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex w-[205px] flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    >
      <img
        src={emptyCourseImage}
        alt=""
        aria-hidden="true"
        className="h-[131px] w-[184px] object-cover"
      />
      <div className="w-full space-y-1">
        <h2 className="type-head-sb-18 text-gray-900">{title}</h2>
        <p className="type-body-r-14 text-gray-300">{description}</p>
      </div>
    </section>
  )
}

export { EmptyState }
export type { EmptyStateProps }
