"use client"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"
import Image from "next/image"
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
      <Image
        src="/img/dog.png"
        alt="문제를 확인하는 반려견"
        width={120}
        height={120}
        className="h-[121px] w-auto object-contain"
      />
      <h1 className="type-body-sb-16">알 수 없는 에러가 발생했습니다</h1>
      <p className="type-caption-r-12 text-gray-400">
        예기치 못한 에러가 발생했습니다
        <br />
        다시 시작해 주세요
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
