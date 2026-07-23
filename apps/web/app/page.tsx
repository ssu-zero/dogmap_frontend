import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <section className="flex max-w-md flex-col items-center gap-4 text-center">
        <span className="text-5xl" aria-hidden>
          🐕
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Dogmap</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          반려견과 함께할 수 있는 장소를 한눈에 찾아보세요.
        </p>
        <Button>시작하기</Button>
      </section>
    </main>
  )
}
