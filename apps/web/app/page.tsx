import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <main className="layout-mobile flex min-h-svh items-center justify-center bg-gray-50">
      <section className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
        <span className="text-5xl" aria-hidden>
          🐕
        </span>
        <h1 className="type-head-sb-24 text-gray-900">개동여지도</h1>
        <p className="type-body-r-14 text-gray-400">
          반려동물과 떠나는 맞춤 여행 코스
        </p>
        <Link
          href="/design-system"
          className="type-body-sb-16 mt-4 flex h-16 w-full items-center justify-center rounded-lg bg-red-600 px-6 text-white transition-colors hover:bg-red-700 active:bg-red-800"
        >
          디자인 시스템 보기
        </Link>
        <Button variant="secondary" className="w-full">
          시작하기
        </Button>
      </section>
    </main>
  )
}
