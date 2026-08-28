import { cn } from "@workspace/ui/lib/utils"

type LoadingStep = "past" | "current" | "upcoming"
type LoadingState = "default" | "ing" | "past"

function Loading({
  state = "ing",
  className,
}: {
  state?: LoadingState
  className?: string
}) {
  const current = state === "ing"
  const past = state === "past"
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className={cn("flex rounded-full p-0.5", current && "bg-red-300")}>
        <span
          className={cn(
            "size-2 rounded-full",
            current || past ? "bg-red-600" : "bg-gray-150"
          )}
        />
      </span>
      <p
        className={cn(
          current || past
            ? "type-head-sb-18 text-gray-600"
            : "type-body-r-16 text-gray-400"
        )}
      >
        {current || past ? "주변 동반 가능 장소" : "체중에 맞는 산책 코스"}
      </p>
      {(current || past) && (
        <span
          className={cn(
            "type-body-r-14",
            current ? "text-red-700" : "text-gray-200"
          )}
        >
          {current ? "탐색중 ···" : "탐색 완료"}
        </span>
      )}
    </div>
  )
}
function LoadingSteps({
  steps,
  className,
}: {
  steps: LoadingStep[]
  className?: string
}) {
  return (
    <ol className={cn("flex items-center gap-4", className)}>
      {steps.map((step, index) => (
        <li
          key={index}
          className={cn(
            "size-3 rounded-full",
            step === "past" && "bg-red-600",
            step === "current" && "bg-red-300 ring-4 ring-red-100",
            step === "upcoming" && "bg-gray-150"
          )}
        >
          <span className="sr-only">{step}</span>
        </li>
      ))}
    </ol>
  )
}
export { Loading, LoadingSteps }
export type { LoadingState, LoadingStep }
