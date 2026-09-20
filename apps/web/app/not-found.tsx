import Link from "next/link"
import Image from "next/image"

export default function NotFound() {
  return (
    <main className="layout-mobile flex flex-col items-center justify-center gap-2 bg-gray-50 px-5 text-center">
      <Image
        src="/img/empty-state-404.png"
        alt="길을 찾는 반려견"
        width={184}
        height={131}
        className="mb-2 h-[131px] w-[184px] object-contain"
      />
      <h1 className="type-head-sb-18">페이지를 찾을 수 없습니다</h1>
      <p className="type-body-r-14 text-gray-300">
        찾으시려는 페이지가 존재하지 않거나
        <br />
        이동되었을 수 있습니다
      </p>
      <Link
        href="/"
        className="type-body-sb-16 mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-red-600 px-10 text-white"
      >
        홈으로 돌아가기
      </Link>
    </main>
  )
}
