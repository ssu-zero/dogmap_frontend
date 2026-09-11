"use client"
import { Button } from "@workspace/ui/components/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <main className="layout-mobile flex min-h-svh flex-col items-center justify-center gap-4 bg-white px-5 text-center">
      <h1 className="type-head-sb-24">문제가 발생했어요</h1>
      <p className="type-body-r-14 text-gray-400">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button onClick={reset}>다시 시도</Button>
    </main>
  )
}
