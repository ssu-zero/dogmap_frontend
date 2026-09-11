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
import { AgreeButton, ChoiceButton } from "@workspace/ui/components/selection"
import { TextField } from "@workspace/ui/components/text-field"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { AppShell } from "./app-shell"
import { useAppFlow } from "./app-flow-provider"
import { communityCourses, type Course } from "./mock-data"

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
  | "mypage"
  | "mypage-edit"
  | "error"

function FlowScreen({
  screen,
  courseId,
}: {
  screen: Screen
  courseId?: string
}) {
  const router = useRouter()
  const {
    courses,
    createCourse,
    draftTitle,
    saveCourse,
    setDraftTitle,
    setTermsAgreed,
    termsAgreed,
    updateUser,
    user,
  } = useAppFlow()
  const [title, setTitle] = useState(draftTitle)
  const [allAgreed, setAllAgreed] = useState(false)
  const [requiredAgreed, setRequiredAgreed] = useState(false)
  const [saved, setSaved] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [name, setName] = useState(user.name)
  const [age, setAge] = useState(user.age)

  const course = findCourse(courseId, courses)
  const ownCourse = course?.userId === user.id

  useEffect(() => {
    if (screen !== "generating") return
    const timeout = window.setTimeout(() => {
      const generated = createCourse(draftTitle)
      router.replace(`/courses/${generated.id}`)
    }, 1200)
    return () => window.clearTimeout(timeout)
  }, [createCourse, draftTitle, router, screen])

  if (screen === "login") {
    return (
      <Plain>
        <section className="flex min-h-svh flex-col justify-between px-5 py-12">
          <div className="space-y-4">
            <span className="text-5xl" aria-hidden>
              🐕
            </span>
            <h1 className="type-head-sb-24">개동여지도</h1>
            <p className="type-body-r-16 text-gray-400">
              반려견과 떠나는 맞춤 여행 코스
            </p>
          </div>
          <div className="space-y-3">
            <Button size="full" onClick={() => router.push("/onboarding/1")}>
              카카오로 시작하기
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

  if (screen === "onboarding-one" || screen === "onboarding-two") {
    const second = screen === "onboarding-two"
    return (
      <Plain>
        <section className="flex min-h-svh flex-col px-5 py-8">
          <div className="flex-1 space-y-6">
            <LoadingSteps
              steps={second ? ["past", "current"] : ["current", "upcoming"]}
            />
            <span className="block pt-16 text-6xl" aria-hidden>
              {second ? "🗺️" : "🐶"}
            </span>
            <h1 className="type-head-sb-24">
              {second
                ? "제로와 갈 곳을 찾아볼까요?"
                : "반려견 정보를 알려주세요"}
            </h1>
            <p className="type-body-r-16 text-gray-400">
              {second
                ? "취향에 맞는 산책 코스를 추천해 드릴게요."
                : "함께할 반려견을 등록하면 더 알맞게 추천할 수 있어요."}
            </p>
          </div>
          <div className="flex gap-3">
            {second ? (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => router.back()}
              >
                이전
              </Button>
            ) : null}
            <Button
              className="flex-1"
              onClick={() => router.push(second ? "/terms" : "/onboarding/2")}
            >
              다음
            </Button>
          </div>
        </section>
      </Plain>
    )
  }

  if (screen === "terms") {
    const agreeAll = () => {
      const next = !allAgreed
      setAllAgreed(next)
      setRequiredAgreed(next)
    }
    return (
      <Plain>
        <Header title="약관 동의" onBack={() => router.back()} />
        <section className="space-y-4 px-5 pt-6">
          <h1 className="type-head-sb-24">
            서비스 이용을 위해
            <br />
            약관에 동의해 주세요
          </h1>
          <button
            className="type-body-sb-16 flex w-full items-center gap-3 border-b border-gray-100 py-5 text-left"
            onClick={agreeAll}
            aria-pressed={allAgreed}
          >
            <span className={allAgreed ? "text-red-600" : "text-gray-200"}>
              ●
            </span>
            전체 동의
          </button>
          <div className="space-y-2">
            <AgreeButton
              checked={requiredAgreed}
              onClick={() => setRequiredAgreed((value) => !value)}
            >
              필수 · 서비스 이용약관{" "}
              <Link
                href="/terms/service"
                onClick={(event) => event.stopPropagation()}
              >
                보기
              </Link>
            </AgreeButton>
            <AgreeButton
              checked={requiredAgreed}
              onClick={() => setRequiredAgreed((value) => !value)}
            >
              필수 · 개인정보 처리방침{" "}
              <Link
                href="/terms/privacy"
                onClick={(event) => event.stopPropagation()}
              >
                보기
              </Link>
            </AgreeButton>
          </div>
          <Button
            size="full"
            disabled={!requiredAgreed}
            className="mt-8"
            onClick={() => {
              setTermsAgreed(true)
              router.push("/")
            }}
          >
            동의하고 시작하기
          </Button>
        </section>
      </Plain>
    )
  }

  if (screen === "terms-detail")
    return (
      <Plain>
        <Header title="약관 상세" onBack={() => router.back()} />
        <article className="space-y-4 px-5 py-6">
          <h1 className="type-head-sb-22">서비스 이용약관</h1>
          <p className="type-body-r-14 whitespace-pre-line text-gray-500">
            개동여지도는 반려동물과 함께할 수 있는 장소와 코스를 탐색할 수
            있도록 돕습니다.{"\n\n"}서비스 이용과 개인정보 처리에 관한 필수
            안내를 확인해 주세요.
          </p>
        </article>
      </Plain>
    )

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
      </AppShell>
    )

  if (screen === "courses")
    return (
      <AppShell tab="course">
        <Header title="내 코스" />
        <section className="flex min-h-[calc(100svh-8.5rem)] flex-col px-5 pb-6">
          {courses.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              <EmptyState />
              <Button size="full" onClick={() => router.push("/courses/new")}>
                새 코스 만들기
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
            setDraftTitle(title)
            router.push("/courses/generating")
          }}
        >
          <div>
            <h1 className="type-head-sb-24">어떤 산책을 원하시나요?</h1>
            <p className="type-body-r-14 mt-2 text-gray-400">
              조건을 선택하면 코스를 추천해 드릴게요.
            </p>
          </div>
          <TextField
            state={title ? "completed" : "writing"}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="코스 이름"
          />
          <div className="grid grid-cols-3 gap-2">
            <ChoiceButton state="selected">
              산책<small>60~90분</small>
            </ChoiceButton>
            <ChoiceButton>
              카페<small>여유롭게</small>
            </ChoiceButton>
            <ChoiceButton>
              활동<small>신나게</small>
            </ChoiceButton>
          </div>
          <Button size="full" type="submit" disabled={!title.trim()}>
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

  if (screen === "course-detail" || screen === "community-detail") {
    if (!course)
      return (
        <Plain>
          <Header title="코스" onBack={() => router.back()} />
          <p className="p-5">코스를 찾을 수 없어요.</p>
        </Plain>
      )
    return (
      <Plain>
        <Header
          title={screen === "community-detail" ? "커뮤니티 코스" : "코스 상세"}
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
          <div className="flex h-44 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
            지도 영역
          </div>
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
          {screen === "community-detail" && !ownCourse ? (
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
          ) : null}
        </section>
      </Plain>
    )
  }

  if (screen === "community")
    return (
      <AppShell tab="community">
        <Header title="커뮤니티" />
        <section className="space-y-3 px-5 py-5">
          {communityCourses.map((item) => (
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

  if (screen === "mypage")
    return (
      <AppShell tab="mypage">
        <Header title="마이페이지" />
        <section className="space-y-6 px-5 py-6">
          <div className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-full bg-red-100 text-3xl">
              🐶
            </span>
            <div>
              <h1 className="type-head-sb-20">{user.name}</h1>
              <p className="type-body-r-14 text-gray-400">
                {user.dogName} · {user.age}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <ListRow
              label="프로필 수정"
              onClick={() => router.push("/mypage/edit")}
            />
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
            updateUser({ name, age })
            router.push("/mypage")
          }}
        >
          <div className="flex justify-center">
            <span className="flex size-24 items-center justify-center rounded-full bg-red-100 text-4xl">
              🐶
            </span>
          </div>
          <label className="block space-y-2">
            <span className="type-body-sb-14">보호자 이름</span>
            <TextField
              state="completed"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="block space-y-2">
            <span className="type-body-sb-14">반려견 나이</span>
            <TextField
              state="completed"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </label>
          <Button size="full" type="submit" disabled={!name.trim()}>
            저장하기
          </Button>
        </form>
      </Plain>
    )

  return (
    <Plain>
      <section className="flex min-h-svh flex-col items-center justify-center gap-5 px-5 text-center">
        <span className="text-5xl">⚠️</span>
        <h1 className="type-head-sb-24">문제가 발생했어요</h1>
        <p className="type-body-r-14 text-gray-400">
          잠시 후 다시 시도하거나 홈으로 돌아가 주세요.
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
