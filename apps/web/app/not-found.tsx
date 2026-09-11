import Link from "next/link"

export default function NotFound() {
  return (
    <main className="layout-mobile flex min-h-svh flex-col items-center justify-center gap-4 bg-white px-5 text-center">
      <span className="text-5xl">🐾</span>
      <h1 className="type-head-sb-24">페이지를 찾을 수 없어요</h1>
      <p className="type-body-r-14 text-gray-400">주소를 다시 확인해 주세요.</p>
      <Link
        href="/"
        className="type-body-sb-16 rounded-full bg-red-600 px-8 py-4 text-white"
      >
        홈으로 돌아가기
      </Link>
    </main>
  )
}
