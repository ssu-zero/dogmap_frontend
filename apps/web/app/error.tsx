"use client"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
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
      <div className="flex gap-2">
        <Button variant="secondary" onClick={reset}>
          다시 시도
        </Button>
        <Link
          href="/"
          className="type-body-sb-14 inline-flex h-11 items-center justify-center rounded-lg bg-red-600 px-4 text-white"
        >
          홈으로
        </Link>
      </div>
    </main>
  )
}
