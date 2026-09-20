"use client"
import { Button } from "@workspace/ui/components/button"
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
    <main className="layout-mobile flex flex-col items-center justify-center gap-2 bg-gray-50 px-5 text-center">
      <Image
        src="/img/empty-state-404.png"
        alt="문제를 확인하는 반려견"
        width={184}
        height={131}
        className="mb-2 h-[131px] w-[184px] object-contain"
      />
      <h1 className="type-head-sb-18">알 수 없는 에러가 발생했습니다</h1>
      <p className="type-body-r-14 text-gray-300">다시 시작해주세요</p>
      <Button className="mt-5 px-10" onClick={reset}>
        돌아가기
      </Button>
    </main>
  )
}
