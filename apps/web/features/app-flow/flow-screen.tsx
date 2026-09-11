"use client"

import { Button } from "@workspace/ui/components/button"
import { Chip } from "@workspace/ui/components/chip"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { Header } from "@workspace/ui/components/header"
import {
  CourseCard,
  CourseListItem,
  ListRow,
} from "@workspace/ui/components/list"
import { Loading, LoadingSteps } from "@workspace/ui/components/loading"
import { ChoiceButton } from "@workspace/ui/components/selection"
import { TextField } from "@workspace/ui/components/text-field"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { AppShell } from "./app-shell"
import { useAppFlow } from "./app-flow-provider"
import {
  communityCourses,
  courseDurations,
  courseThemes,
  isDogInfoComplete,
  isDogNameValid,
  isCourseDraftComplete,
  requiredTermKeys,
  termsContent,
  toggleCourseTheme,
  type Course,
  type RequiredTermKey,
} from "./mock-data"

type Screen =
  | "login"
  | "onboarding-one"
  | "onboarding-two"
  | "terms"
  | "terms-detail"
  | "home"
  | "courses"
  | "new-course"
  | "generating"
  | "course-detail"
  | "community"
  | "community-detail"
  | "archive"
  | "archive-detail"
  | "report"
  | "mypage"
  | "mypage-edit"
  | "error"

function FlowScreen({
  screen,
  courseId,
  term,
}: {
  screen: Screen
  courseId?: string
  term?: RequiredTermKey
}) {
  const router = useRouter()
  const {
    courses,
    createCourse,
    courseDraft,
    dismissLocationPermissionPrompt,
    completeOnboarding,
    locationPermissionPromptOpen,
    onboarding,
    saveCourse,
    saveDiary,
    diaries,
    updateCourseDraft,
    setAllTerms,
    setTerm,
    terms,
    termsAgreed,
    updateOnboarding,
    updateUser,
    user,
  } = useAppFlow()
  const [saved, setSaved] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)
  const [name, setName] = useState(user.name)
  const [age, setAge] = useState(user.age)
  const [dogName, setDogName] = useState(user.dogName)
  const [draftDiaries, setDraftDiaries] = useState<Record<string, string>>({})
  const [communityFilter, setCommunityFilter] = useState<
    "전체" | "소형" | "중형" | "대형"
  >("전체")

  const course = findCourse(courseId, courses)
  const ownCourse = course?.userId === user.id

  useEffect(() => {
    if (screen !== "generating") return
    const timeout = window.setTimeout(() => {
      const generated = createCourse(courseDraft)
      router.replace(`/courses/${generated.id}`)
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [courseDraft, createCourse, router, screen])

  if (screen === "login") {
    return (
      <Plain>
        <section className="flex min-h-svh flex-col justify-between px-5 py-12">
          <div className="space-y-4">
            <Image
              src="/logo/with_paw.png"
              alt="개동여지도"
              width={160}
              height={64}
              className="h-auto w-40"
            />
            <h1 className="type-head-sb-24">개동여지도</h1>
            <p className="type-body-r-16 text-gray-400">
              반려견과 떠나는 맞춤 여행 코스
            </p>
          </div>
          <div className="space-y-3">
            <Button size="full" onClick={() => router.push("/terms")}>
              카카오 로그인
            </Button>
            <Button
              variant="secondary"
              size="full"
              onClick={() => router.push(termsAgreed ? "/" : "/terms")}
            >
              기존 사용자로 둘러보기
            </Button>
          </div>
        </section>
      </Plain>
    )
  }

  if (screen === "onboarding-one") {
    const nameValid = isDogNameValid(onboarding.dogName)
    return (
      <Plain>
        <section className="flex min-h-svh flex-col py-8">
          <div className="flex-1 space-y-6">
            <LoadingSteps steps={["current", "upcoming"]} />
            <Image
              src="/img/dog.png"
              alt="반려견 프로필"
              width={120}
              height={120}
              className="mx-auto mt-12 size-30 rounded-full object-cover"
            />
            <h1 className="type-head-sb-24">
              함께 여행할 친구를
              <br />
              소개해 주세요
            </h1>
            <label className="block space-y-2">
              <span className="type-body-sb-16">이름을 입력해주세요*</span>
              <TextField
                aria-label="반려견 이름"
                state={onboarding.dogName ? "completed" : "writing"}
                value={onboarding.dogName}
                maxLength={20}
                onChange={(event) =>
                  updateOnboarding({ dogName: event.target.value })
                }
                placeholder="반려견 이름"
              />
            </label>
            {onboarding.dogName && !nameValid ? (
              <p className="type-caption-r-12 text-red-600">
                이름을 1~20자로 입력해주세요.
              </p>
            ) : null}
          </div>
          <Button
            size="full"
            disabled={!nameValid}
            onClick={() => router.push("/onboarding/2")}
          >
            다음
          </Button>
        </section>
      </Plain>
    )
  }

  if (screen === "onboarding-two") {
    const complete = isDogInfoComplete(onboarding)
    return (
      <Plain>
        <section className="flex min-h-svh flex-col py-8">
          <div className="flex-1 space-y-6">
            <button
              type="button"
              className="-ml-2"
              onClick={() => router.back()}
              aria-label="이전 단계로"
            >
              <span aria-hidden>‹</span>
            </button>
            <LoadingSteps steps={["past", "current"]} />
            <div>
              <h1 className="type-head-sb-24">
                {onboarding.dogName}에게 맞는
                <br />
                코스를 짜드릴게요
              </h1>
              <p className="type-body-r-16 mt-3 text-gray-400">
                입력한 정보로 산책 코스와 장소를 추천해줘요
              </p>
            </div>
            <label className="block space-y-2">
              <span className="type-body-sb-16">출생연도*</span>
              <TextField
                aria-label="출생연도"
                inputMode="numeric"
                maxLength={4}
                placeholder="예: 2023"
                value={onboarding.birthYear}
                state={onboarding.birthYear ? "completed" : "writing"}
                onChange={(event) =>
                  updateOnboarding({
                    birthYear: event.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </label>
            <fieldset className="space-y-3">
              <legend className="type-body-sb-16">크기*</legend>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["small", "소형", "10kg 이하"],
                    ["medium", "중형", "10kg ~ 25kg"],
                    ["large", "대형", "25kg 이상"],
                  ] as const
                ).map(([size, label, description]) => (
                  <ChoiceButton
                    key={size}
                    aria-pressed={onboarding.dogSize === size}
                    state={onboarding.dogSize === size ? "selected" : "default"}
                    description={description}
                    onClick={() => updateOnboarding({ dogSize: size })}
                  >
                    {label}
                  </ChoiceButton>
                ))}
              </div>
            </fieldset>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="type-body-r-14 text-gray-500">
                체중·나이는 권장 체류시간을 계산하고 무리 없는 코스를 추천하는
                데 사용돼요.
              </p>
            </div>
          </div>
          <Button
            size="full"
            disabled={!complete}
            onClick={() => {
              completeOnboarding()
              router.push("/")
            }}
          >
            개동여지도 시작하기
          </Button>
        </section>
      </Plain>
    )
  }

  if (screen === "terms") {
    const allAgreed = requiredTermKeys.every((term) => terms[term])
    return (
      <Plain>
        <section className="flex min-h-svh flex-col py-12">
          <div className="flex-1 space-y-5">
            <h1 className="type-head-sb-24">약관에 동의해주세요</h1>
            <p className="type-body-r-16 text-gray-400">
              서비스를 이용하기 위해서는 동의가 필요해요.
            </p>
            <button
              className="type-body-sb-16 flex w-full items-center gap-3 border-b border-gray-100 py-5 text-left"
              onClick={() => setAllTerms(!allAgreed)}
              aria-pressed={allAgreed}
            >
              <span className={allAgreed ? "text-red-600" : "text-gray-200"}>
                ●
              </span>
              네, 모두 동의합니다.
            </button>
            <div className="space-y-3">
              <TermRow
                term="service"
                label="서비스 이용약관"
                checked={terms.service}
                onToggle={setTerm}
              />
              <TermRow
                term="privacy"
                label="개인정보 처리방침"
                checked={terms.privacy}
                onToggle={setTerm}
              />
              <TermRow
                term="location"
                label="위치 기반 서비스 이용약관"
                checked={terms.location}
                onToggle={setTerm}
              />
            </div>
          </div>
          <Button
            size="full"
            disabled={!termsAgreed}
            onClick={() => router.push("/onboarding/1")}
          >
            가입 완료
          </Button>
        </section>
      </Plain>
    )
  }

  if (screen === "terms-detail") {
    const selectedTerm = term ?? "service"
    const detail = termsContent[selectedTerm]
    return (
      <Plain>
        <Header title="약관 상세" onBack={() => router.back()} />
        <article className="space-y-4 px-5 py-6">
          <h1 className="type-head-sb-22">{detail.title}</h1>
          <p className="type-body-r-14 whitespace-pre-line text-gray-500">
            {detail.body}
          </p>
        </article>
      </Plain>
    )
  }

  if (screen === "home")
    return (
      <AppShell tab="home">
        <section className="space-y-6 px-5 py-8">
          <div>
            <p className="type-body-r-14 text-gray-400">
              {user.dogName}와 함께
            </p>
            <h1 className="type-head-sb-24">오늘은 어디로 갈까요?</h1>
          </div>
          <section className="rounded-2xl bg-red-50 p-5">
            <p className="type-body-sb-16">맞춤 산책 코스를 만들어 보세요</p>
            <p className="type-body-r-14 mt-1 text-gray-500">
              시간과 취향에 맞춰 추천해 드려요.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/courses/new")}
            >
              코스 만들기
            </Button>
          </section>
          <section className="space-y-3">
            <h2 className="type-head-sb-20">추천 코스</h2>
            {communityCourses.slice(0, 1).map((item) => (
              <button
                className="w-full text-left"
                key={item.id}
                onClick={() => router.push(`/community/${item.id}`)}
              >
                <CourseCard
                  title={item.title}
                  hours={1.5}
                  spots={item.places.length}
                  variant="community-y"
                />
              </button>
            ))}
          </section>
        </section>
        {locationPermissionPromptOpen ? (
          <div
            className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-8"
            role="dialog"
            aria-modal="true"
            aria-label="위치 정보 권한"
          >
            <section className="w-full max-w-62.5 rounded-xl bg-white p-6 text-center shadow-lg">
              <p className="type-head-sb-18">
                위치 정보 권한 허용을 위해
                <br />
                설정으로 이동합니다
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="dark"
                  onClick={dismissLocationPermissionPrompt}
                >
                  아니요
                </Button>
                <Button
                  variant="secondary"
                  onClick={dismissLocationPermissionPrompt}
                >
                  설정
                </Button>
              </div>
            </section>
          </div>
        ) : null}
      </AppShell>
    )

  if (screen === "courses")
    return (
      <AppShell tab="course">
        <Header title="내 코스" />
        <section className="flex min-h-[calc(100svh-8.5rem)] flex-col px-5 pb-6">
          {courses.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              <EmptyState
                title="아직 만든 코스가 없어요"
                description="제로와 떠날 첫 여행 코스를 지금 만들어보세요"
              />
              <Button size="full" onClick={() => router.push("/courses/new")}>
                첫 코스 만들기
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 py-5">
                {courses.map((item) => (
                  <button
                    className="w-full text-left"
                    key={item.id}
                    onClick={() => router.push(`/courses/${item.id}`)}
                  >
                    <CourseCard
                      title={item.title}
                      hours={item.duration / 60}
                      spots={item.places.length}
                    />
                  </button>
                ))}
              </div>
              <Button size="full" onClick={() => router.push("/courses/new")}>
                새 코스 만들기
              </Button>
            </>
          )}
        </section>
      </AppShell>
    )

  if (screen === "new-course")
    return (
      <Plain>
        <Header title="코스 만들기" onBack={() => router.back()} />
        <form
          className="space-y-6 px-5 py-6"
          onSubmit={(event) => {
            event.preventDefault()
            if (!isCourseDraftComplete(courseDraft)) return
            router.push("/courses/generating")
          }}
        >
          <div className="rounded-2xl bg-gray-100 px-5 py-5">
            <p className="type-body-sb-16">
              {user.dogName} · {user.age} 기준으로 짜드려요
            </p>
            <p className="type-body-r-14 mt-1 text-gray-400">
              여행할 날짜와 출발 정보를 알려주세요.
            </p>
          </div>
          <label className="block space-y-2">
            <span className="type-body-sb-16">날짜*</span>
            <TextField
              aria-label="날짜"
              type="date"
              state={courseDraft.date ? "completed" : "writing"}
              value={courseDraft.date}
              onChange={(event) => updateCourseDraft({ date: event.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-2">
              <span className="type-body-sb-16">시작 시간*</span>
              <TextField
                aria-label="시작 시간"
                type="time"
                state={courseDraft.startTime ? "completed" : "writing"}
                value={courseDraft.startTime}
                onChange={(event) => updateCourseDraft({ startTime: event.target.value })}
              />
            </label>
            <label className="block space-y-2">
              <span className="type-body-sb-16">종료 시간*</span>
              <TextField
                aria-label="종료 시간"
                type="time"
                state={courseDraft.endTime ? "completed" : "writing"}
                value={courseDraft.endTime}
                onChange={(event) => updateCourseDraft({ endTime: event.target.value })}
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="type-body-sb-16">출발 위치*</span>
            <TextField
              aria-label="출발 위치"
              state={courseDraft.startLocation ? "completed" : "writing"}
              value={courseDraft.startLocation}
              onChange={(event) => updateCourseDraft({ startLocation: event.target.value })}
              placeholder="현재 위치 · 익산역"
            />
          </label>
          <label className="block space-y-2">
            <span className="type-body-sb-16">코스 이름*</span>
            <TextField
              aria-label="코스 이름"
              state={courseDraft.title ? "completed" : "writing"}
              value={courseDraft.title}
              maxLength={30}
              onChange={(event) =>
                updateCourseDraft({ title: event.target.value })
              }
              placeholder="코스 이름"
            />
          </label>
          <fieldset className="space-y-3">
            <legend className="type-body-sb-16">산책 시간*</legend>
            <div className="grid grid-cols-3 gap-2">
              {courseDurations.map((duration) => (
                <ChoiceButton
                  key={duration}
                  state={
                    courseDraft.duration === duration ? "selected" : "default"
                  }
                  aria-pressed={courseDraft.duration === duration}
                  onClick={() => updateCourseDraft({ duration })}
                  description="추천"
                >
                  {duration}분
                </ChoiceButton>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="type-body-sb-16">어떤 곳을 들를까요?*</legend>
            <div className="grid grid-cols-3 gap-2">
              {courseThemes.map((theme) => {
                const selected = courseDraft.themes.includes(theme)
                return (
                  <ChoiceButton
                    key={theme}
                    state={selected ? "selected" : "default"}
                    aria-pressed={selected}
                    onClick={() =>
                      updateCourseDraft({
                        themes: toggleCourseTheme(courseDraft.themes, theme),
                      })
                    }
                    description={
                      theme === "산책"
                        ? "가볍게"
                        : theme === "카페"
                          ? "여유롭게"
                          : "신나게"
                    }
                  >
                    {theme}
                  </ChoiceButton>
                )
              })}
            </div>
          </fieldset>
          <p className="type-caption-r-12 text-gray-400">
            필수 조건과 원하는 코스를 모두 선택하면 추천을 시작할 수 있어요.
          </p>
          <Button
            size="full"
            type="submit"
            disabled={!isCourseDraftComplete(courseDraft)}
          >
            코스 생성하기
          </Button>
        </form>
      </Plain>
    )

  if (screen === "generating")
    return (
      <Plain>
        <section className="flex min-h-svh flex-col justify-center gap-8 px-8">
          <LoadingSteps steps={["past", "current", "upcoming"]} />
          <div>
            <h1 className="type-head-sb-24">
              제로에게 딱 맞는
              <br />
              코스를 만들고 있어요
            </h1>
            <p className="type-body-r-14 mt-2 text-gray-400">
              잠시만 기다려 주세요.
            </p>
          </div>
          <Loading state="ing" />
        </section>
      </Plain>
    )

  if (screen === "course-detail" || screen === "community-detail" || screen === "archive-detail") {
    if (!course)
      return (
        <Plain>
          <Header title="코스" onBack={() => router.back()} />
          <p className="p-5">코스를 찾을 수 없어요.</p>
        </Plain>
      )
    const diary = draftDiaries[course.id] ?? diaries[course.id] ?? ""
    return (
      <Plain>
        <Header
          title={screen === "community-detail" ? "커뮤니티 코스" : screen === "archive-detail" ? "발자국" : "코스 상세"}
          onBack={() => router.back()}
          trailing={
            ownCourse ? (
              <Button
                variant="text"
                size="sm"
                onClick={() => setListOpen((value) => !value)}
              >
                목록
              </Button>
            ) : undefined
          }
        />
        <section className="space-y-5 px-5 py-4">
          <div>
            <div className="flex items-center justify-between">
              <Chip variant={ownCourse ? "selected" : "softRed"}>
                {ownCourse ? "내 코스" : "추천 코스"}
              </Chip>
              {course.edge ? <Chip variant="outline">엣지 케이스</Chip> : null}
            </div>
            <h1 className="type-head-sb-24 mt-3">{course.title}</h1>
            <p className="type-body-r-14 mt-1 text-gray-400">
              약 {course.duration}분 · {course.places.length}곳
            </p>
          </div>
          <button
            type="button"
            className="flex h-44 w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400"
            aria-label="코스 지도 보기"
            onClick={() => setSelectedPlace(course.places[0] ?? null)}
          >
            지도에서 스팟 보기
          </button>
          {selectedPlace ? (
            <section
              className="rounded-xl bg-red-50 p-4"
              role="dialog"
              aria-label="스팟 상세"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="type-body-sb-16">{selectedPlace}</p>
                  <p className="type-body-r-14 mt-1 text-gray-500">
                    반려견 동반 가능 · 코스에 포함된 추천 스팟이에요.
                  </p>
                </div>
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => setSelectedPlace(null)}
                >
                  닫기
                </Button>
              </div>
            </section>
          ) : null}
          {listOpen ? (
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="type-body-sb-14">내 코스 관리</p>
              <Button
                variant="text"
                size="sm"
                onClick={() => setListOpen(false)}
              >
                목록 닫기
              </Button>
            </div>
          ) : null}
          <section className="space-y-2">
            {course.places.map((place, index) => (
              <CourseListItem
                key={place}
                index={index + 1}
                title={place}
                category="반려견 동반 가능"
              />
            ))}
          </section>
          {screen === "archive-detail" ? (
            <section className="space-y-3 rounded-2xl bg-orange-50 p-4">
              <div>
                <h2 className="type-body-sb-16">오늘의 여행 일기</h2>
                <p className="type-body-r-14 mt-1 text-gray-500">코스에서 남기고 싶은 순간을 기록해 보세요.</p>
              </div>
              <textarea
                aria-label="여행 일기"
                className="type-body-r-14 min-h-28 w-full rounded-xl border border-gray-150 bg-white p-3 focus:outline-none"
                placeholder="오늘 {user.dogName}와 함께한 이야기를 남겨보세요."
                value={diary}
                onChange={(event) =>
                  setDraftDiaries((previous) => ({
                    ...previous,
                    [course.id]: event.target.value,
                  }))
                }
              />
              <Button
                size="full"
                disabled={!diary.trim()}
                onClick={() => saveDiary(course.id, diary)}
              >
                {diaries[course.id] ? "일기 수정하기" : "일기 저장하기"}
              </Button>
              {diaries[course.id] ? (
                <p className="type-caption-r-12 text-gray-500">일기를 저장했어요.</p>
              ) : null}
            </section>
          ) : null}
          {screen === "course-detail" && ownCourse ? (
            <Button
              size="full"
              variant="secondary"
              onClick={() => router.push("/courses")}
            >
              내 코스 목록 보기
            </Button>
          ) : null}
          {screen === "community-detail" && !ownCourse ? (
            <div className="space-y-2">
              <Button
                size="full"
                variant={saved ? "secondary" : "primary"}
                onClick={() => {
                  saveCourse(course)
                  setSaved(true)
                }}
              >
                {saved ? "내 코스에 저장됨" : "내 코스에 저장"}
              </Button>
              {saved ? (
                <Button
                  size="full"
                  variant="text"
                  onClick={() => router.push("/courses")}
                >
                  저장한 코스 확인하기
                </Button>
              ) : null}
            </div>
          ) : null}
        </section>
      </Plain>
    )
  }

  if (screen === "community")
    return (
      <AppShell tab="community">
        <Header title="커뮤니티" />
        <section className="space-y-4 px-5 py-5">
          <div className="flex gap-2" role="group" aria-label="반려견 크기 필터">
            {(["전체", "대형", "중형", "소형"] as const).map((filter) => (
              <Chip
                key={filter}
                variant={communityFilter === filter ? "selected" : "light"}
                onClick={() => setCommunityFilter(filter)}
                aria-pressed={communityFilter === filter}
              >
                {filter}
              </Chip>
            ))}
          </div>
          {communityCourses
            .filter(
              (item) =>
                communityFilter === "전체" || item.dogSize === communityFilter
            )
            .map((item) => (
            <button
              key={item.id}
              className="w-full text-left"
              onClick={() => router.push(`/community/${item.id}`)}
            >
              <CourseCard
                title={item.title}
                hours={item.duration / 60}
                spots={item.places.length}
                variant={
                  item.userId === user.id ? "community-y" : "community-n"
                }
              />
            </button>
            ))}
        </section>
      </AppShell>
    )

  if (screen === "archive")
    return (
      <AppShell tab="archive">
        <section className="space-y-6 px-5 py-6">
          <div>
            <h1 className="type-head-sb-24">{user.dogName}의 발자국</h1>
            <p className="type-body-sb-16 mt-2">지금까지의 여정</p>
          </div>
          {courses.length === 0 ? (
            <EmptyState
              title="아직 남긴 발자국이 없어요"
              description="첫 코스를 만들고 제로와의 여행을 기록해 보세요."
            />
          ) : (
            <section className="space-y-3" aria-label="여행 발자국">
              {courses.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left"
                  onClick={() => router.push(`/archive/${item.id}`)}
                >
                  <CourseCard title={item.title} hours={item.duration / 60} spots={item.places.length} />
                </button>
              ))}
            </section>
          )}
          <section className="rounded-2xl bg-gray-50 p-4">
            <h2 className="type-body-sb-16">이달의 활동</h2>
            <p className="type-body-r-14 mt-2 text-gray-500">완성한 코스 {courses.length}개 · 새로운 발자국을 남겨보세요.</p>
          </section>
          <Button size="full" variant="secondary" onClick={() => router.push("/report")}>
            활동 리포트 보기
          </Button>
        </section>
      </AppShell>
    )

  if (screen === "report")
    return (
      <AppShell tab="archive">
        <section className="space-y-6 px-5 py-6">
          <div>
            <h1 className="type-head-sb-24">{user.dogName}의 발자국</h1>
            <p className="type-body-sb-16 mt-2">지금까지의 여정</p>
          </div>
          <section className="rounded-2xl bg-gray-50 p-5">
            <h2 className="type-body-sb-16">이번 달 산책 리포트</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3">
                <dt className="type-caption-r-12 text-gray-400">완성한 코스</dt>
                <dd className="type-head-sb-24 mt-1">{courses.length}개</dd>
              </div>
              <div className="rounded-xl bg-white p-3">
                <dt className="type-caption-r-12 text-gray-400">남긴 일기</dt>
                <dd className="type-head-sb-24 mt-1">{Object.keys(diaries).length}개</dd>
              </div>
            </dl>
          </section>
          <section>
            <h2 className="type-body-sb-16">뱃지</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["첫 발자국", "산책 친구", "기록왕"].map((badge) => (
                <div key={badge} className="rounded-xl border border-orange-100 p-3 text-center">
                  <span aria-hidden="true" className="text-2xl">🐾</span>
                  <p className="type-caption-r-12 mt-2">{badge}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </AppShell>
    )

  if (screen === "mypage")
    return (
      <AppShell tab="mypage">
        <Header title="마이페이지" />
        <section className="space-y-6 px-5 py-6">
          <div className="flex items-center gap-4">
            <Image
              src="/img/profile.png"
              alt={`${user.dogName} 프로필`}
              width={80}
              height={80}
              className="size-20 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <h1 className="type-head-sb-20">{user.dogName}</h1>
              <p className="type-body-r-14 text-gray-400">
                {user.age} · 소형견
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push("/mypage/edit")}
            >
              수정
            </Button>
          </div>
          <div className="space-y-2">
            <p className="type-caption-r-12 text-gray-400">보호자 {user.name}</p>
            <ListRow
              label="약관 보기"
              onClick={() => router.push("/terms/service")}
            />
            <ListRow
              label="오류 화면 보기"
              onClick={() => router.push("/error-demo")}
            />
          </div>
        </section>
      </AppShell>
    )

  if (screen === "mypage-edit")
    return (
      <Plain>
        <Header title="프로필 수정" onBack={() => router.back()} />
        <form
          className="space-y-5 px-5 py-6"
          onSubmit={(event) => {
            event.preventDefault()
            updateUser({
              name: name.trim(),
              age: age.trim(),
              dogName: dogName.trim(),
            })
            router.push("/mypage")
          }}
        >
          <div className="flex justify-center">
            <Image
              src="/img/profile.png"
              alt={`${dogName || "반려견"} 프로필`}
              width={96}
              height={96}
              className="size-24 rounded-full object-cover"
            />
          </div>
          <label className="block space-y-2">
            <span className="type-body-sb-14">보호자 이름</span>
            <TextField
              aria-label="보호자 이름"
              state="completed"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="type-body-sb-14">반려견 이름</span>
            <TextField
              aria-label="반려견 이름 수정"
              state="completed"
              value={dogName}
              maxLength={20}
              onChange={(event) => setDogName(event.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="type-body-sb-14">반려견 나이</span>
            <TextField
              aria-label="반려견 나이"
              state="completed"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </label>
          <Button
            size="full"
            type="submit"
            disabled={!name.trim() || !dogName.trim() || !age.trim()}
          >
            저장하기
          </Button>
        </form>
      </Plain>
    )

  return (
    <Plain>
      <section className="flex min-h-svh flex-col items-center justify-center gap-5 px-5 text-center">
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
          <Button variant="secondary" onClick={() => router.refresh()}>
            다시 시도
          </Button>
          <Button onClick={() => router.push("/")}>홈으로</Button>
        </div>
      </section>
    </Plain>
  )
}

function Plain({ children }: { children: React.ReactNode }) {
  return <main className="layout-mobile min-h-svh bg-white">{children}</main>
}

function TermRow({
  term,
  label,
  checked,
  onToggle,
}: {
  term: RequiredTermKey
  label: string
  checked: boolean
  onToggle: (term: RequiredTermKey, value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        className="type-body-r-16 flex min-w-0 items-center gap-3 text-left"
        aria-label={`${label} 동의`}
        aria-pressed={checked}
        onClick={() => onToggle(term, !checked)}
      >
        <span className={checked ? "text-red-600" : "text-gray-200"}>●</span>
        <span>(필수) {label}</span>
      </button>
      <Link
        href={`/terms/${term}`}
        className="type-body-r-14 shrink-0 text-gray-400"
      >
        보기
      </Link>
    </div>
  )
}
function findCourse(id: string | undefined, courses: Course[]) {
  if (id === "edge-case")
    return {
      id,
      userId: "zero",
      title: "장소가 적은 짧은 산책",
      duration: 30,
      places: ["출발지 주변"],
      edge: true,
    }
  return (
    courses.find((item) => item.id === id) ??
    communityCourses.find((item) => item.id === id)
  )
}

export { FlowScreen }
