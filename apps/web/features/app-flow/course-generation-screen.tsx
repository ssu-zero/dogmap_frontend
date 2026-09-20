"use client"

import { Button } from "@workspace/ui/components/button"
import { Chip } from "@workspace/ui/components/chip"
import { TimelineSpot } from "@workspace/ui/components/list"
import Image from "next/image"

import { fallbackCoordinates, KakaoCourseMap } from "./kakao-course-map"
import type { Course } from "./mock-data"

const generationSteps = [
  {
    label: "주변 동반 가능 장소",
    pending: "탐색중 ···",
    done: "탐색 완료",
  },
  {
    label: "체중에 맞는 산책 코스",
    pending: "계산중 ···",
    done: "탐색 완료",
  },
  {
    label: "시간표 코스",
    pending: "조합중 ···",
    done: "조합 완료",
  },
  {
    label: "이동 동선",
    pending: "그리는 중 ···",
    done: "완료",
  },
] as const

export const GENERATION_STEP_DURATION_MS = 2_500
export const GENERATION_MINIMUM_DURATION_MS =
  generationSteps.length * GENERATION_STEP_DURATION_MS

type CourseGenerationScreenProps = {
  dogName: string
  step: number
  error: string | null
  onRetry: () => void
  onChangeLocation: () => void
  revealing: boolean
  completedCourse: Course | null
  requiresLogin: boolean
  noCandidates: boolean
}

export function CourseGenerationScreen({
  dogName,
  step,
  error,
  onRetry,
  onChangeLocation,
  revealing,
  completedCourse,
  requiresLogin,
  noCandidates,
}: CourseGenerationScreenProps) {
  return (
    <main className="layout-mobile bg-white">
      <section
        className="relative flex min-h-[inherit] flex-col overflow-hidden px-5 pt-[60px] pb-6"
        style={{ backgroundImage: "var(--gradient-accent)" }}
        aria-busy={!error && !revealing}
      >
        <header>
          <h1 className="type-head-sb-24 tracking-[-0.01em] whitespace-pre-line text-gray-800">
            {`${dogName} 맞춤 코스를\n만들고 있어요`}
          </h1>
          <p className="type-body-r-14 mt-3 tracking-[-0.01em] text-gray-400">
            잠시만 기다려 주세요
          </p>
        </header>

        <ol className="mt-11" aria-label="코스 생성 진행 상태">
          {generationSteps.map((item, index) => {
            const isCurrent = index === step
            const isDone = index < step
            const isUpcoming = index > step

            return (
              <li key={item.label}>
                <div
                  className="flex min-h-6 items-center gap-4"
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <span
                    className={`flex size-3 shrink-0 items-center justify-center rounded-full ${
                      isCurrent ? "bg-red-300" : ""
                    }`}
                    aria-hidden="true"
                  >
                    <span
                      className={`size-2 rounded-full ${
                        isUpcoming ? "bg-gray-150" : "bg-red-600"
                      }`}
                    />
                  </span>
                  <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span
                      className={
                        isUpcoming
                          ? "type-body-r-16 text-gray-400"
                          : "type-head-sb-18 text-gray-600"
                      }
                    >
                      {item.label}
                    </span>
                    {isDone || isCurrent ? (
                      <span
                        className={`type-body-r-14 ${
                          isCurrent ? "text-red-700" : "text-gray-200"
                        }`}
                      >
                        {isCurrent ? item.pending : item.done}
                      </span>
                    ) : null}
                  </div>
                </div>
                {index < generationSteps.length - 1 ? (
                  <div
                    className="ml-1 flex h-[30px] w-1 flex-col items-center justify-around"
                    aria-hidden="true"
                  >
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className={`size-1 rounded-full ${
                          index <= step ? "bg-red-200" : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>

        {error ? (
          <div className="mt-8 space-y-4" role="alert">
            <p className="type-body-r-14 text-red-700">{error}</p>
            <Button
              size="full"
              onClick={noCandidates && !requiresLogin ? onChangeLocation : onRetry}
            >
              {requiresLogin
                ? "로그인하기"
                : noCandidates
                  ? "장소 바꾸기"
                  : "다시 시도"}
            </Button>
          </div>
        ) : null}

        {completedCourse ? (
          <div
            className={`absolute inset-0 z-10 overflow-hidden bg-gray-900 text-gray-50 ${
              revealing ? "course-generation-reveal" : "translate-y-full"
            }`}
            aria-hidden="true"
            inert
          >
            <div className="relative h-84 overflow-hidden">
              <KakaoCourseMap
                center={completedCourse.startCoordinates ?? fallbackCoordinates}
                path={completedCourse.path}
                places={completedCourse.places}
                onSelectPlace={() => undefined}
                className="size-full"
                dark
              />
              <Image
                src="/img/dog_small.png"
                alt=""
                width={88}
                height={71}
                className="pointer-events-none absolute top-[167px] left-[10px] h-[71px] w-[88px]"
              />
            </div>
            <div className="relative -mt-28 min-h-full space-y-5 rounded-t-[20px] bg-gray-900 px-5 py-6">
              <div className="flex items-center gap-2">
                <h2 className="type-head-sb-22 text-gray-50">
                  {completedCourse.title}
                </h2>
                <Chip variant="dark">예정</Chip>
              </div>
              <div className="space-y-0">
                {completedCourse.places.map((place, index) => (
                  <TimelineSpot
                    key={`${place}-${index}`}
                    title={place}
                    time={completedCourse.startTime ?? "오전 10 : 00"}
                    chip="장소"
                    variant="dark-course"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
