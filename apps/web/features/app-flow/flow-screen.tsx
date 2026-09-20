"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Chip } from "@workspace/ui/components/chip"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { Header } from "@workspace/ui/components/header"
import { Icon } from "@workspace/ui/components/icon"
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
import { useEffect, useRef, useState } from "react"

import { getAccessToken, getSignupToken, setAccessToken } from "@/api/client"
import { getMyDogImageUploadUrl } from "@/api/dog"
import {
  courseDetailQueryOptions,
  createCourseMutationOptions,
  courseQueryKeys,
  myCoursesQueryOptions,
  nearbyCoursesQueryOptions,
  replaceCoursePlacesMutationOptions,
  savedCoursesQueryOptions,
  saveCourseMutationOptions,
} from "@/query/course"
import {
  updateWalkLogMutationOptions,
  walkLogQueryKeys,
  walkLogsQueryOptions,
} from "@/query/log"
import { nearbyPlacesQueryOptions } from "@/query/place"
import {
  dogQueryKeys,
  myDogQueryOptions,
  registerDogMutationOptions,
  updateMyDogMutationOptions,
} from "@/query/dog"

import { getKakaoAuthorizeUrl, useDemoMode } from "../auth/kakao"
import {
  apiCourseToFlowCourse,
  courseDraftToApiRequest,
  nearbyCourseToFlowCourse,
  onboardingToDogCreate,
} from "./api-mappers"

import { AppShell } from "./app-shell"
import { useAppFlow } from "./app-flow-provider"
import { fallbackCoordinates, KakaoCourseMap } from "./kakao-course-map"
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

const onboardingCtaClass =
  "px-4 text-[18px] leading-[1.3] tracking-[-0.01em] disabled:bg-gray-150 disabled:text-white"

/**
 * Entry state deliberately lives at the root route: the production app must
 * never expose an authenticated home screen merely because a visitor opened
 * `/`. Demo mode remains available for the clickable design harness.
 */
function AppEntry() {
  const demoMode = useDemoMode()
  const [hasAccessToken, setHasAccessToken] = useState(false)

  useEffect(() => {
    const syncAuthState = () => setHasAccessToken(Boolean(getAccessToken()))
    syncAuthState()
    window.addEventListener("dogmap:auth-changed", syncAuthState)
    return () =>
      window.removeEventListener("dogmap:auth-changed", syncAuthState)
  }, [])

  return <FlowScreen screen={demoMode || hasAccessToken ? "home" : "login"} />
}

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
    createCourse: createDemoCourse,
    addCourse,
    coordinates,
    courseDraft,
    dismissLocationPermissionPrompt,
    completeOnboarding,
    locationPermissionPromptOpen,
    onboarding,
    saveCourse,
    saveDiary,
    diaries,
    updateCourseDraft,
    updateCoordinates,
    setAllTerms,
    setTerm,
    terms,
    termsAgreed,
    updateOnboarding,
    updateUser,
    user,
  } = useAppFlow()
  const queryClient = useQueryClient()
  const demoMode = useDemoMode()
  const generationStarted = useRef(false)
  const dogHydrated = useRef(false)
  const [hasAccessToken, setHasAccessToken] = useState(false)
  const [authConfigurationError, setAuthConfigurationError] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [onboardingNameFocused, setOnboardingNameFocused] = useState(false)
  const [birthYearMenuOpen, setBirthYearMenuOpen] = useState(false)
  const registerDog = useMutation(registerDogMutationOptions())
  const createApiCourse = useMutation(createCourseMutationOptions())
  const replaceCoursePlaces = useMutation(replaceCoursePlacesMutationOptions())
  const saveApiCourse = useMutation(saveCourseMutationOptions())
  const updateWalkLog = useMutation(updateWalkLogMutationOptions())
  const updateDog = useMutation(updateMyDogMutationOptions())
  const myDog = useQuery({
    ...myDogQueryOptions(),
    enabled: hasAccessToken && !demoMode,
  })
  const nearbyCourses = useQuery({
    ...nearbyCoursesQueryOptions({
      lat: coordinates.lat,
      lng: coordinates.lng,
      radius_m: 3000,
      limit: 10,
    }),
    enabled:
      !demoMode &&
      (screen === "home" ||
        screen === "community" ||
        (screen === "course-detail" && Boolean(courseId))),
  })
  const myCourses = useQuery({
    ...myCoursesQueryOptions(),
    enabled: hasAccessToken && !demoMode,
  })
  const savedCourses = useQuery({
    ...savedCoursesQueryOptions(),
    enabled: hasAccessToken && !demoMode,
  })
  const courseDetail = useQuery({
    ...courseDetailQueryOptions(courseId ?? ""),
    enabled:
      hasAccessToken &&
      !demoMode &&
      Boolean(courseId) &&
      (screen === "course-detail" ||
        screen === "community-detail" ||
        screen === "archive-detail"),
  })
  const walkLogs = useQuery({
    ...walkLogsQueryOptions(),
    enabled:
      hasAccessToken &&
      !demoMode &&
      (screen === "archive" || screen === "archive-detail" || screen === "report"),
  })
  const [saved, setSaved] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)
  const [name, setName] = useState(user.name)
  const [age, setAge] = useState(user.age)
  const [dogName, setDogName] = useState(user.dogName)
  const [dogSize, setDogSize] = useState<"SMALL" | "MEDIUM" | "LARGE">("SMALL")
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [draftDiaries, setDraftDiaries] = useState<Record<string, string>>({})
  const [communityFilter, setCommunityFilter] = useState<
    "전체" | "소형" | "중형" | "대형"
  >("전체")
  const [homeCategory, setHomeCategory] = useState<
    "전체" | "식당" | "산책" | "카페" | "액티비티"
  >("전체")
  const nearbyPlaces = useQuery({
    ...nearbyPlacesQueryOptions({
      lat: coordinates.lat,
      lng: coordinates.lng,
      category: homeCategory === "전체" ? "카페" : homeCategory,
      radius_m: 2000,
      limit: 3,
    }),
    enabled: hasAccessToken && !demoMode && screen === "home",
  })

  const serverRecommendations = (nearbyCourses.data ?? []).map((item) =>
    nearbyCourseToFlowCourse(item, user.id)
  )
  const serverMyCourses = (myCourses.data ?? []).map((item) =>
    nearbyCourseToFlowCourse(item, user.id)
  )
  const serverSavedCourses = (savedCourses.data ?? []).map(
    (item) => nearbyCourseToFlowCourse(item, user.id)
  )
  const serverDetailCourse = courseDetail.data
    ? apiCourseToFlowCourse(courseDetail.data, user.id)
    : undefined
  const displayedCourses = demoMode
    ? courses
    : dedupeCourses([...serverMyCourses, ...serverSavedCourses, ...courses])
  const archiveCourses = demoMode ? courses : dedupeCourses([...serverMyCourses, ...courses])
  const logByCourseId = new Map(
    (walkLogs.data ?? [])
      .filter((log) => log.course_id !== null)
      .map((log) => [String(log.course_id), log])
  )
  const course = findCourse(
    courseId,
    [
      ...(serverDetailCourse ? [serverDetailCourse] : []),
      ...displayedCourses,
      ...serverRecommendations,
    ],
    demoMode
  )
  const ownCourse = course?.userId === user.id
  const generationDisplayError =
    generationError ??
    createApiCourse.error?.message ??
    (screen === "generating" && !demoMode && !hasAccessToken
      ? "코스를 만들려면 카카오 로그인이 필요합니다."
      : null)
  const activeDogSize = myDog.data?.size ?? dogSize
  const activeDogSizeLabel =
    activeDogSize === "SMALL"
      ? "소형견"
      : activeDogSize === "MEDIUM"
        ? "중형견"
        : "대형견"
  const profileImageSrc =
    profileImagePreview ?? myDog.data?.image_url ?? "/img/profile.png"

  useEffect(() => {
    const syncAuthState = () => setHasAccessToken(Boolean(getAccessToken()))
    syncAuthState()
    window.addEventListener("dogmap:auth-changed", syncAuthState)
    return () =>
      window.removeEventListener("dogmap:auth-changed", syncAuthState)
  }, [])

  useEffect(() => {
    if (!myDog.data || dogHydrated.current) return
    dogHydrated.current = true
    const nextAge =
      myDog.data.age === null ? "나이 미입력" : `${myDog.data.age}살`
    setDogName(myDog.data.name)
    setAge(nextAge)
    setDogSize(myDog.data.size)
    updateUser({
      dogName: myDog.data.name,
      age: nextAge,
    })
  }, [myDog.data, updateUser])

  useEffect(() => {
    if (screen !== "generating" || generationStarted.current) return
    generationStarted.current = true

    if (demoMode) {
      const timeout = window.setTimeout(() => {
        const generated = createDemoCourse(courseDraft)
        router.replace(`/courses/${generated.id}`)
      }, 1200)
      return () => {
        window.clearTimeout(timeout)
        generationStarted.current = false
      }
    }

    if (!getAccessToken()) {
      return
    }

    void createApiCourse
      .mutateAsync(courseDraftToApiRequest(courseDraft, coordinates))
      .then(async (result) => {
        const finalized = await replaceCoursePlaces.mutateAsync({
          courseId: String(result.course_id),
          places: result.places,
          path: result.path,
          endedAt: `${courseDraft.date}T${courseDraft.endTime || "00:00"}:00+09:00`,
        })
        const generated = apiCourseToFlowCourse(finalized, user.id)
        addCourse(generated)
        queryClient.invalidateQueries({ queryKey: courseQueryKeys.mine })
        router.replace(`/courses/${generated.id}`)
      })
      .catch((error: Error) => {
        setGenerationError(error.message)
      })
  }, [
    addCourse,
    coordinates,
    courseDraft,
    createApiCourse,
    createDemoCourse,
    demoMode,
    replaceCoursePlaces,
    router,
    screen,
    user.id,
  ])

  if (screen === "login") {
    return (
      <Plain>
        <section className="relative flex min-h-[inherit] flex-col bg-red-600 px-5 pb-6 pt-40">
          <div className="flex flex-col items-center text-center">
            <p className="type-body-r-16 text-gray-50">반려동물 맞춤 산책코스</p>
            <Image
              src="/logo/login-main.svg"
              alt="개동여지도"
              width={218}
              height={55}
              priority
              className="mt-4 h-[55px] w-[218px]"
            />
          </div>
          <Image
            src="/img/dog_home.png"
            alt="여행을 준비하는 반려견"
            width={136}
            height={157}
            priority
            unoptimized
            className="pointer-events-none absolute right-9 bottom-8 h-[157px] w-[136px] object-contain"
          />
          <div className="relative z-10 mt-auto space-y-2">
            <Button
              size="md"
              aria-label="카카오 로그인"
              className="type-body-r-16 h-12 w-full rounded-full bg-[#fee500] font-medium text-black hover:bg-[#fee500]"
              onClick={() => {
                if (demoMode) {
                  router.push("/terms")
                  return
                }

                const authorizeUrl = getKakaoAuthorizeUrl()
                if (!authorizeUrl) {
                  setAuthConfigurationError(true)
                  return
                }
                window.location.assign(authorizeUrl)
              }}
            >
              <Image src="/logo/kakao.svg" alt="" width={16} height={16} />
              카카오로 계속하기
            </Button>
            {authConfigurationError ? (
              <p role="alert" className="type-caption-r-12 text-white">
                카카오 로그인 환경 설정이 필요합니다.
              </p>
            ) : null}
          </div>
        </section>
      </Plain>
    )
  }

  if (screen === "onboarding-one") {
    const nameValid = isDogNameValid(onboarding.dogName)
    return (
      <Plain>
        <section className="flex min-h-[inherit] flex-col bg-white">
          <header className="flex h-[60px] shrink-0 items-center px-4 py-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로 가기"
              className="flex size-6 items-center justify-center"
            >
              <Icon name="arrowLeft" className="size-6" />
            </button>
          </header>
          <div className="flex min-h-0 flex-1 flex-col px-5">
            <h1 className="type-head-sb-24 whitespace-pre-line tracking-[-0.023em] text-gray-800">
              {"함께 여행할 친구를\n소개해주세요!"}
            </h1>
            <div className="relative mx-auto mt-8 size-30 shrink-0">
              {onboarding.profileImagePreview ? (
                <img
                  src={onboarding.profileImagePreview}
                  alt="선택한 반려견 프로필"
                  className="size-full rounded-full border-[3px] border-gray-900 object-cover"
                />
              ) : null}
              <label
                className={`absolute flex size-8 cursor-pointer items-center justify-center ${
                  onboarding.profileImagePreview
                    ? "bottom-0 right-0"
                    : "left-1/2 top-[88px] -translate-x-1/2"
                }`}
              >
                <span className="sr-only">반려견 사진 추가</span>
                <Image
                  src="/icons/onboarding/plus.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8"
                />
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const image = event.currentTarget.files?.[0]
                    if (!image) return

                    const reader = new FileReader()
                    reader.addEventListener("load", () => {
                      updateOnboarding({
                        profileImagePreview:
                          typeof reader.result === "string"
                            ? reader.result
                            : null,
                      })
                    })
                    reader.readAsDataURL(image)
                  }}
                />
              </label>
            </div>
            <TextField
              aria-label="반려견 이름"
              state={
                onboardingNameFocused
                  ? "writing"
                  : onboarding.dogName
                    ? "completed"
                    : "default"
              }
              value={onboarding.dogName}
              maxLength={20}
              onFocus={() => setOnboardingNameFocused(true)}
              onBlur={() => setOnboardingNameFocused(false)}
              onChange={(event) =>
                updateOnboarding({ dogName: event.target.value })
              }
              placeholder="이름을 입력해주세요"
              className="mt-8 h-14 text-center"
            />
            <div className="mt-auto pb-6 pt-8">
              <Button
                size="full"
                variant="dark"
                className={onboardingCtaClass}
                disabled={!nameValid}
                onClick={() => router.push("/onboarding/2")}
              >
                다음
              </Button>
            </div>
          </div>
        </section>
      </Plain>
    )
  }

  if (screen === "onboarding-two") {
    const complete = isDogInfoComplete(onboarding)
    const birthYears = Array.from({ length: 22 }, (_, index) =>
      String(new Date().getFullYear() - index)
    )
    return (
      <Plain>
        <section className="flex min-h-[inherit] flex-col bg-white">
          <header className="flex h-[60px] shrink-0 items-center px-4 py-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로 가기"
              className="flex size-6 items-center justify-center"
            >
              <Icon name="arrowLeft" className="size-6" />
            </button>
          </header>
          <div className="flex min-h-0 flex-1 flex-col px-5">
            <h1 className="type-head-sb-24 whitespace-pre-line tracking-[-0.023em] text-gray-800">
              {onboarding.dogName
                ? <>
                    <span className="text-red-600">{onboarding.dogName}</span>
                    {` 반가워요!\n`}
                    {onboarding.dogName}를 소개해주세요
                  </>
                : "반려견 반가워요!\n반려견을 소개해주세요"}
            </h1>
            <div className="-mx-1 mt-7 w-full">
              <fieldset>
                <legend className="type-body-sb-16 px-1 text-gray-800">
                  크기
                </legend>
                <div className="mt-3 grid grid-cols-3 gap-1">
                  {(
                    [
                      ["small", "소형", "10kg이하"],
                      ["medium", "중형", "10kg ~ 25kg"],
                      ["large", "대형", "25kg이상"],
                    ] as const
                  ).map(([size, label, description]) => (
                    <ChoiceButton
                      key={size}
                      aria-pressed={onboarding.dogSize === size}
                      state={
                        onboarding.dogSize === size ? "selected" : "default"
                      }
                      description={description}
                      descriptionClassName={`text-[14px] leading-[1.5] font-normal tracking-[-0.01em] ${
                        onboarding.dogSize === size
                          ? "text-gray-300"
                          : "text-gray-200"
                      }`}
                      className={`h-16 min-h-0 min-w-0 w-full ${
                        onboarding.dogSize && onboarding.dogSize !== size
                          ? "opacity-40"
                          : ""
                      }`}
                      onClick={() => updateOnboarding({ dogSize: size })}
                    >
                      {label}
                    </ChoiceButton>
                  ))}
                </div>
              </fieldset>
              <div className="mt-7 flex flex-col gap-3">
                <p
                  id="birth-year-label"
                  className="type-body-sb-16 px-1 text-gray-900"
                >
                  출생연도
                </p>
                <div className="relative">
                  <button
                    type="button"
                    aria-labelledby="birth-year-label"
                    aria-haspopup="listbox"
                    aria-expanded={birthYearMenuOpen}
                    aria-controls="birth-year-options"
                    onClick={() => setBirthYearMenuOpen((open) => !open)}
                    className={`type-body-sb-16 flex h-12 w-full items-center justify-between rounded-xl bg-gray-50 px-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                      onboarding.birthYear ? "text-gray-900" : "text-gray-150"
                    }`}
                  >
                    <span>
                      {onboarding.birthYear
                        ? `${onboarding.birthYear}년`
                        : "출생연도를 선택해주세요"}
                    </span>
                    <Image
                      src="/icons/onboarding/arrow-down.svg"
                      alt=""
                      width={24}
                      height={24}
                      className={`size-6 transition-transform ${
                        birthYearMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {birthYearMenuOpen ? (
                    <div
                      id="birth-year-options"
                      role="listbox"
                      aria-labelledby="birth-year-label"
                      className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-[0_8px_20px_rgba(21,21,21,0.12)]"
                    >
                      {birthYears.map((year) => {
                        const selected = onboarding.birthYear === year
                        return (
                          <button
                            key={year}
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`type-body-sb-16 flex h-11 w-full items-center rounded-lg px-5 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none ${
                              selected ? "bg-gray-50 text-gray-900" : "text-gray-700"
                            }`}
                            onClick={() => {
                              updateOnboarding({ birthYear: year })
                              setBirthYearMenuOpen(false)
                            }}
                          >
                            {year}년
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="mt-auto pt-8">
              <div className="flex flex-col gap-1 rounded-xl bg-gray-50 px-5 py-3">
                <Image
                  src="/icons/onboarding/paw-fill.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                />
                <p className="type-body-r-14 break-keep font-medium tracking-[-0.019em] text-gray-200">
                  체중·나이는 산책 스팟의 권장 체류시간을 계산하는데 쓰여요.
                  어린·노령 반려동물은 무리 없는 코스로 조정돼요.
                </p>
              </div>
              <div className="pb-6 pt-6">
                <Button
                  size="full"
                  variant="dark"
                  className={onboardingCtaClass}
                  disabled={
                    !complete ||
                    registerDog.isPending ||
                    (!demoMode && !getSignupToken())
                  }
                  onClick={() => {
                    if (demoMode) {
                      completeOnboarding()
                      router.push("/")
                      return
                    }

                    if (!getSignupToken()) return
                    registerDog.mutate(onboardingToDogCreate(onboarding), {
                      onSuccess: (result) => {
                        setAccessToken(result.access_token)
                        updateUser({
                          dogName: result.dog.name,
                          age:
                            result.dog.age === null
                              ? "나이 미입력"
                              : `${result.dog.age}살`,
                        })
                        completeOnboarding()
                        queryClient.setQueryData(dogQueryKeys.me, result.dog)
                        router.push("/")
                      },
                    })
                  }}
                >
                  {registerDog.isPending ? "프로필 등록 중" : "다음"}
                </Button>
              </div>
            </div>
            {registerDog.isError ? (
              <p role="alert" className="type-caption-r-12 -mt-4 pb-6 text-red-600">
                {registerDog.error.message}
              </p>
            ) : null}
          </div>
        </section>
      </Plain>
    )
  }

  if (screen === "terms") {
    const allAgreed = requiredTermKeys.every((term) => terms[term])
    return (
      <Plain>
        <section className="relative flex min-h-[inherit] flex-col px-5">
          <header className="-mx-5 flex h-[60px] shrink-0 items-center px-4">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로 가기"
              className="flex size-6 items-center justify-center"
            >
              <Icon name="arrowLeft" className="size-6" />
            </button>
          </header>
          <div className="relative">
            <Image
              src="/icons/terms/bone.svg"
              alt=""
              width={71}
              height={54}
              className="absolute right-[17px] top-[-20px] h-[54px] w-[71px] rotate-30"
            />
            <h1 className="type-head-sb-24 whitespace-pre-line text-gray-800">
              {"개동여지도 약관을\n확인하고 동의해주세요."}
            </h1>
          </div>
          <div className="mt-auto flex shrink-0 flex-col gap-6 pb-8 pt-6">
            <div className="flex flex-col gap-5">
              <button
                className="type-body-sb-16 flex h-12 w-full items-center gap-3 border-b border-gray-150 p-3 text-left text-gray-700"
                aria-label="네, 모두 동의합니다."
                onClick={() => setAllTerms(!allAgreed)}
                aria-pressed={allAgreed}
              >
                <Image
                  src={
                    allAgreed
                      ? "/icons/terms/check-fill-selected.svg"
                      : "/icons/terms/check-fill-default.svg"
                  }
                  alt=""
                  width={20}
                  height={20}
                  className="size-5"
                />
                모두 동의하기
              </button>
              <div className="space-y-2">
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
              aria-label="가입 완료"
              disabled={!termsAgreed}
              variant="dark"
              className="disabled:text-white"
              onClick={() => router.push("/onboarding/1")}
            >
              확인
            </Button>
          </div>
        </section>
      </Plain>
    )
  }

  if (screen === "terms-detail") {
    const selectedTerm = term ?? "service"
    const detail = termsContent[selectedTerm]
    return (
      <Plain>
        <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
          <header className="flex h-[60px] shrink-0 items-center px-4 py-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로 가기"
              className="flex size-6 items-center justify-center"
            >
              <Icon name="arrowLeft" className="size-6" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-32">
            <div className="flex flex-col gap-2">
              <h1 className="type-head-sb-24 text-gray-800">{detail.title}</h1>
              <p className="type-body-r-13 rounded bg-gray-50 px-3 py-2 text-gray-200">
                ( {detail.effectiveDate} )
              </p>
            </div>
            <article className="mt-6 flex flex-col gap-5 pb-5">
              {detail.sections.map((section) => (
                <section key={section.heading} className="space-y-2">
                  <h2 className="type-head-sb-18 text-gray-800">
                    {section.heading}
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="type-body-r-14 break-keep text-gray-400"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.items ? (
                    <ol className="type-body-r-14 list-decimal space-y-0.5 break-keep pl-5 text-gray-400 marker:text-gray-400">
                      {section.items.map((item) => (
                        <li key={item} className="pl-0.5">
                          {item}
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </section>
              ))}
            </article>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-b from-white/0 via-white/90 to-white pt-6">
            <div className="pointer-events-auto px-5 pb-6">
              <Button size="full" variant="dark" onClick={() => router.back()}>
                확인
              </Button>
            </div>
          </div>
        </section>
      </Plain>
    )
  }

  if (screen === "home")
    return (
      <AppShell tab="home">
        <section className="relative overflow-hidden bg-gray-900 px-5 pb-8 pt-10 text-white">
          <Image
            src="/logo/with_paw.png"
            alt="개동여지도"
            width={124}
            height={30}
            priority
            className="h-[30px] w-[124px] brightness-0 invert"
          />
          <Image
            src="/img/dog.png"
            alt="여행을 준비하는 반려견"
            width={206}
            height={260}
            priority
            className="pointer-events-none absolute right-[-8px] top-14 h-[210px] w-auto object-contain"
          />
          <div className="relative mt-11 space-y-6">
            <h1 className="type-head-sb-24 whitespace-pre-line">
              {`오늘 ${user.dogName}랑\n어디 놀러 갈까요?`}
            </h1>
            <Button
              size="md"
              className="rounded-xl px-10"
              onClick={() => router.push("/courses/new")}
            >
              코스 만들기
            </Button>
          </div>
        </section>
        <section className="-mt-1 flex-1 rounded-t-2xl border-t-2 border-gray-200 bg-white px-5 py-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="type-head-sb-20">동반 가능시설</h2>
              <span className="type-body-r-14 text-gray-200">내 주변</span>
            </div>
            <p className="type-body-r-14 text-gray-400">
              {user.dogName}와 함께 갈 수 있어요!
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="장소 카테고리">
              {(["전체", "식당", "산책", "카페", "액티비티"] as const).map((category) => (
                <Chip
                  key={category}
                  variant={homeCategory === category ? "selected" : "light"}
                  className="shrink-0"
                  aria-pressed={homeCategory === category}
                  onClick={() => setHomeCategory(category)}
                >
                  {category}
                </Chip>
              ))}
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {demoMode ? (
              communityCourses.slice(0, 3).map((item) => (
                <button
                  className="w-full text-left"
                  key={item.id}
                  onClick={() => router.push(`/community/${item.id}`)}
                >
                  <CourseCard
                    title={item.title}
                    hours={item.duration / 60}
                    spots={item.placeCount ?? item.places.length}
                    variant="community-y"
                  />
                </button>
              ))
            ) : nearbyPlaces.data?.length ? (
              nearbyPlaces.data.map((place) => (
                <article
                  key={place.content_id}
                  className="flex min-h-26 items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3"
                >
                  <div className="min-w-0 space-y-2">
                    <h3 className="type-body-sb-16 truncate text-gray-600">{place.title}</h3>
                    <p className="type-body-r-13 text-gray-400">
                      {place.category} · {(place.dist / 1000).toFixed(1)}km
                    </p>
                    <p className="type-caption-r-12 text-red-700">반려견 동반 가능</p>
                  </div>
                  {place.image_url ? (
                    <Image
                      src={place.image_url}
                      alt=""
                      width={76}
                      height={76}
                      unoptimized
                      className="size-19 shrink-0 rounded-xl object-cover"
                    />
                  ) : null}
                </article>
              ))
            ) : nearbyPlaces.isPending ? (
              <p className="type-body-r-14 text-gray-400">주변 장소를 불러오고 있어요.</p>
            ) : (
              <p className="type-body-r-14 text-gray-400">주변 동반 가능시설을 준비하고 있어요.</p>
            )}
          </div>
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
                  onClick={() => {
                    if (!("geolocation" in navigator)) {
                      dismissLocationPermissionPrompt()
                      return
                    }
                    navigator.geolocation.getCurrentPosition(({ coords }) => {
                      updateCoordinates({
                        lat: coords.latitude,
                        lng: coords.longitude,
                      })
                      dismissLocationPermissionPrompt()
                    }, dismissLocationPermissionPrompt)
                  }}
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
          {displayedCourses.length === 0 ? (
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
                {displayedCourses.map((item) => (
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
              onChange={(event) =>
                updateCourseDraft({ date: event.target.value })
              }
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
                onChange={(event) =>
                  updateCourseDraft({ startTime: event.target.value })
                }
              />
            </label>
            <label className="block space-y-2">
              <span className="type-body-sb-16">종료 시간*</span>
              <TextField
                aria-label="종료 시간"
                type="time"
                state={courseDraft.endTime ? "completed" : "writing"}
                value={courseDraft.endTime}
                onChange={(event) =>
                  updateCourseDraft({ endTime: event.target.value })
                }
              />
            </label>
          </div>
          <label className="block space-y-2">
            <span className="type-body-sb-16">출발 위치*</span>
            <TextField
              aria-label="출발 위치"
              state={courseDraft.startLocation ? "completed" : "writing"}
              value={courseDraft.startLocation}
              onChange={(event) =>
                updateCourseDraft({ startLocation: event.target.value })
              }
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
        <section className="flex min-h-[inherit] flex-col justify-center gap-8 px-8">
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
          {generationDisplayError ? (
            <div className="space-y-3" role="alert">
              <p className="type-body-r-14 text-red-600">
                {generationDisplayError}
              </p>
              <Button
                size="full"
                onClick={() => {
                  if (!demoMode && !getAccessToken()) {
                    router.replace("/login")
                    return
                  }
                  generationStarted.current = false
                  setGenerationError(null)
                }}
              >
                {!demoMode && !hasAccessToken ? "로그인하기" : "다시 시도"}
              </Button>
            </div>
          ) : (
            <Loading state="ing" />
          )}
        </section>
      </Plain>
    )

  if (
    screen === "course-detail" ||
    screen === "community-detail" ||
    screen === "archive-detail"
  ) {
    if (!course)
      return (
        <Plain>
          <Header title="코스" onBack={() => router.back()} />
          <p className="p-5">코스를 찾을 수 없어요.</p>
        </Plain>
      )
    const serverLog = logByCourseId.get(course.id)
    const diary =
      draftDiaries[course.id] ??
      serverLog?.diary ??
      diaries[course.id] ??
      ""
    return (
      <Plain>
        <div className="relative h-84">
          <KakaoCourseMap
            className="size-full"
            center={course.startCoordinates ?? fallbackCoordinates}
            path={course.path}
            places={course.places}
            onSelectPlace={setSelectedPlace}
          />
          <Header
            className="absolute inset-x-0 top-0 bg-gradient-to-b from-gray-900/80 to-transparent text-white [&_svg]:text-white"
            title={undefined}
            onBack={() => router.back()}
            trailing={
              ownCourse ? (
                <Button
                  variant="text"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={() => setListOpen((value) => !value)}
                >
                  목록
                </Button>
              ) : undefined
            }
          />
        </div>
        <section className="relative -mt-28 space-y-5 rounded-t-2xl bg-gray-900 px-5 py-6 text-white">
          <div>
            <div className="flex items-center justify-between">
              <Chip variant={ownCourse ? "dark" : "red"}>
                {ownCourse ? "내 코스" : "추천 코스"}
              </Chip>
              {course.edge ? <Chip variant="outline">엣지 케이스</Chip> : null}
            </div>
            <h1 className="type-head-sb-24 mt-3">{course.title}</h1>
            <p className="type-body-r-14 mt-1 text-gray-400">
              약 {course.duration}분 ·{" "}
              {course.placeCount ?? course.places.length}곳
            </p>
          </div>
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
            <div className="rounded-xl bg-gray-800 p-4">
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
            {course.summaryOnly ? (
              <p className="rounded-xl bg-gray-800 p-4 text-sm text-gray-400">
                코스의 상세 장소 정보를 불러오고 있어요.
              </p>
            ) : null}
            {course.places.map((place, index) => (
              <CourseListItem
                key={place}
                index={index + 1}
                title={place}
                category="반려견 동반 가능"
                className="border border-gray-600 bg-gray-800 shadow-none"
              />
            ))}
          </section>
          {screen === "archive-detail" ? (
            <section className="space-y-3 rounded-2xl bg-orange-50 p-4">
              <div>
                <h2 className="type-body-sb-16">오늘의 여행 일기</h2>
                <p className="type-body-r-14 mt-1 text-gray-500">
                  코스에서 남기고 싶은 순간을 기록해 보세요.
                </p>
              </div>
              <textarea
                aria-label="여행 일기"
                className="type-body-r-14 min-h-28 w-full rounded-xl border border-gray-150 bg-white p-3 focus:outline-none"
                placeholder={`오늘 ${user.dogName}와 함께한 이야기를 남겨보세요.`}
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
                disabled={!diary.trim() || updateWalkLog.isPending}
                onClick={() => {
                  if (demoMode) {
                    saveDiary(course.id, diary)
                    return
                  }

                  if (!serverLog) return
                  updateWalkLog.mutate(
                    { logId: serverLog.log_id, diary },
                    {
                      onSuccess: () => {
                        setDraftDiaries((previous) => ({
                          ...previous,
                          [course.id]: diary,
                        }))
                        queryClient.invalidateQueries({
                          queryKey: walkLogQueryKeys.all,
                        })
                      },
                    }
                  )
                }}
              >
                {updateWalkLog.isPending
                  ? "저장 중"
                  : serverLog?.diary || diaries[course.id]
                    ? "일기 수정하기"
                    : "일기 저장하기"}
              </Button>
              {!demoMode && !serverLog ? (
                <p className="type-caption-r-12 text-gray-500">
                  완료된 산책에서만 일기를 저장할 수 있어요.
                </p>
              ) : null}
              {serverLog?.diary || diaries[course.id] ? (
                <p className="type-caption-r-12 text-gray-500">
                  일기를 저장했어요.
                </p>
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
                  if (demoMode) {
                    saveCourse(course)
                    setSaved(true)
                    return
                  }

                  saveApiCourse.mutate(course.id, {
                    onSuccess: () => {
                      setSaved(true)
                      queryClient.invalidateQueries({
                        queryKey: courseQueryKeys.saved,
                      })
                    },
                  })
                }}
              >
                {saveApiCourse.isPending
                  ? "저장 중"
                  : saved || course.saved
                    ? "내 코스에 저장됨"
                    : "내 코스에 저장"}
              </Button>
              {saved || course.saved ? (
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
          <>
              <div
                className="flex gap-2"
                role="group"
                aria-label="반려견 크기 필터"
              >
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
              {(demoMode ? communityCourses : serverRecommendations)
                .filter(
                  (item) =>
                    !demoMode ||
                    communityFilter === "전체" ||
                    ("dogSize" in item && item.dogSize === communityFilter)
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
          </>
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
          {archiveCourses.length === 0 ? (
            <EmptyState
              title="아직 남긴 발자국이 없어요"
              description="첫 코스를 만들고 제로와의 여행을 기록해 보세요."
            />
          ) : (
            <section className="space-y-3" aria-label="여행 발자국">
              {archiveCourses.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left"
                  aria-label={item.title}
                  onClick={() => router.push(`/archive/${item.id}`)}
                >
                  <CourseCard
                    title={item.title}
                    hours={item.duration / 60}
                    spots={item.places.length}
                  />
                </button>
              ))}
            </section>
          )}
          <section className="rounded-2xl bg-gray-50 p-4">
            <h2 className="type-body-sb-16">이달의 활동</h2>
            <p className="type-body-r-14 mt-2 text-gray-500">
              완성한 코스 {archiveCourses.length}개 · 새로운 발자국을 남겨보세요.
            </p>
          </section>
          <Button
            size="full"
            variant="secondary"
            onClick={() => router.push("/report")}
          >
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
                <dd className="type-head-sb-24 mt-1">{archiveCourses.length}개</dd>
              </div>
              <div className="rounded-xl bg-white p-3">
                <dt className="type-caption-r-12 text-gray-400">남긴 일기</dt>
                <dd className="type-head-sb-24 mt-1">
                  {demoMode
                    ? `${Object.keys(diaries).length}개`
                    : `${(walkLogs.data ?? []).filter((log) => log.diary).length}개`}
                </dd>
              </div>
            </dl>
          </section>
          <section>
            <h2 className="type-body-sb-16">뱃지</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["첫 발자국", "산책 친구", "기록왕"].map((badge) => (
                <div
                  key={badge}
                  className="rounded-xl border border-orange-100 p-3 text-center"
                >
                  <span aria-hidden="true" className="text-2xl">
                    🐾
                  </span>
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
              src={profileImageSrc}
              alt={`${user.dogName} 프로필`}
              width={80}
              height={80}
              unoptimized={profileImageSrc.startsWith("http")}
              className="size-20 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <h1 className="type-head-sb-20">{user.dogName}</h1>
              <p className="type-body-r-14 text-gray-400">
                {user.age} · {activeDogSizeLabel}
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
            <p className="type-caption-r-12 text-gray-400">
              보호자 {user.name}
            </p>
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
            if (demoMode) {
              updateUser({
                name: name.trim(),
                age: age.trim(),
                dogName: dogName.trim(),
              })
              router.push("/mypage")
              return
            }

            if (!getAccessToken()) {
              setProfileError("프로필을 수정하려면 카카오 로그인이 필요합니다.")
              return
            }

            void (async () => {
              try {
                let imageUrl: string | undefined
                if (profileImageFile) {
                  const extension = profileImageFile.name.split(".").pop() || "jpg"
                  const upload = await getMyDogImageUploadUrl({
                    file_extension: extension.toLowerCase(),
                  })
                  const response = await fetch(upload.upload_url, {
                    method: "PUT",
                    body: profileImageFile,
                  })
                  if (!response.ok) throw new Error("프로필 이미지를 업로드하지 못했어요.")
                  imageUrl = upload.image_url
                }

                const result = await updateDog.mutateAsync({
                  name: dogName.trim(),
                  age: Number(age.replace(/\D/g, "")),
                  size: dogSize,
                  ...(imageUrl ? { image_url: imageUrl } : {}),
                })
                const nextAge =
                  result.age === null ? "나이 미입력" : `${result.age}살`
                updateUser({ dogName: result.name, age: nextAge })
                queryClient.setQueryData(dogQueryKeys.me, result)
                router.push("/mypage")
              } catch (error) {
                setProfileError(
                  error instanceof Error ? error.message : "프로필을 저장하지 못했어요."
                )
              }
            })()
          }}
        >
          <div className="flex justify-center">
            <Image
              src={profileImageSrc}
              alt={`${dogName || "반려견"} 프로필`}
              width={96}
              height={96}
              unoptimized={profileImageSrc.startsWith("http")}
              className="size-24 rounded-full object-cover"
            />
          </div>
          <label className="type-body-sb-14 mx-auto block w-fit cursor-pointer text-red-600">
            사진 변경
            <input
              aria-label="프로필 사진"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setProfileImageFile(file)
                setProfileImagePreview(URL.createObjectURL(file))
              }}
            />
          </label>
          <label className="block space-y-2">
            <span className="type-body-sb-14">
              {demoMode ? "보호자 이름" : "카카오 닉네임"}
            </span>
            <TextField
              aria-label="보호자 이름"
              state="completed"
              value={name}
              readOnly={!demoMode}
              onChange={(event) => setName(event.target.value)}
            />
            {!demoMode ? (
              <p className="type-caption-r-12 text-gray-400">
                보호자 닉네임은 카카오 계정에서 관리해요.
              </p>
            ) : null}
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
          <fieldset className="space-y-3">
            <legend className="type-body-sb-14">반려견 크기</legend>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["SMALL", "소형"],
                  ["MEDIUM", "중형"],
                  ["LARGE", "대형"],
                ] as const
              ).map(([size, label]) => (
                <ChoiceButton
                  key={size}
                  state={dogSize === size ? "selected" : "default"}
                  aria-pressed={dogSize === size}
                  onClick={() => setDogSize(size)}
                >
                  {label}
                </ChoiceButton>
              ))}
            </div>
          </fieldset>
          <Button
            size="full"
            type="submit"
            disabled={
              !name.trim() ||
              !dogName.trim() ||
              !age.replace(/\D/g, "") ||
              (!demoMode && !hasAccessToken) ||
              updateDog.isPending
            }
          >
            {updateDog.isPending ? "저장 중" : "저장하기"}
          </Button>
          {updateDog.isError ? (
            <p role="alert" className="type-caption-r-12 text-red-600">
              {updateDog.error.message}
            </p>
          ) : null}
          {profileError ? (
            <p role="alert" className="type-caption-r-12 text-red-600">
              {profileError}
            </p>
          ) : null}
        </form>
      </Plain>
    )

  return (
    <Plain>
      <section className="flex min-h-[inherit] flex-col items-center justify-center gap-5 px-5 text-center">
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
  return <main className="layout-mobile bg-white">{children}</main>
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
    <div className="flex h-12 items-center justify-between gap-3 rounded bg-gray-50 p-3">
      <button
        type="button"
        className={`type-body-r-16 flex min-w-0 items-center gap-2 text-left ${
          checked ? "text-gray-700" : "text-gray-300"
        }`}
        aria-label={`${label} 동의`}
        aria-pressed={checked}
        onClick={() => onToggle(term, !checked)}
      >
        <Image
          src={
            checked
              ? "/icons/terms/check-line-selected.svg"
              : "/icons/terms/check-line-default.svg"
          }
          alt=""
          width={24}
          height={24}
          className="size-6"
        />
        <span>(필수) {label}</span>
      </button>
      <Link
        href={`/terms/${term}`}
        className="type-body-r-16 shrink-0 px-3 text-red-600"
      >
        보기
      </Link>
    </div>
  )
}
function findCourse(
  id: string | undefined,
  courses: Course[],
  includeDemoCourses: boolean
) {
  if (includeDemoCourses && id === "edge-case")
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
    (includeDemoCourses
      ? communityCourses.find((item) => item.id === id)
      : undefined)
  )
}

function dedupeCourses(courses: Course[]) {
  return courses.filter(
    (course, index) =>
      courses.findIndex((candidate) => candidate.id === course.id) === index
  )
}

export { AppEntry, FlowScreen }
