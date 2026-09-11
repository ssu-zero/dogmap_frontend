import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <main className="layout-mobile flex min-h-svh flex-col items-center justify-center gap-4 bg-white px-5 text-center">
      <Image
        src="/img/dog.png"
        alt="길을 찾는 반려견"
        width={120}
        height={120}
        className="h-[121px] w-auto object-contain"
      />
      <h1 className="type-body-sb-16">페이지를 찾을 수 없습니다</h1>
      <p className="type-caption-r-12 text-gray-400">
        찾으시려는 페이지가 존재하지 않거나
        <br />
        이동되었을 수 있습니다
      </p>
      <Link
        href="/"
        className="type-body-sb-16 rounded-lg bg-gray-900 px-5 py-2 text-white"
      >
        홈으로 돌아가기
      </Link>
    </main>
  )
}
