"use client"

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Chip, PawActivity } from "@workspace/ui/components/chip"
import { EmptyState } from "@workspace/ui/components/empty-state"
import { Header } from "@workspace/ui/components/header"
import { Icon, iconSources } from "@workspace/ui/components/icon"
import {
  CourseCard,
  CourseListItem,
  ListRow,
  TimelineSpot,
} from "@workspace/ui/components/list"
import { ChoiceButton, LikeButton } from "@workspace/ui/components/selection"
import { TextField } from "@workspace/ui/components/text-field"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import homeDogImage from "../../../../packages/ui/src/assets/images/dog.png"
import smallDogImage from "../../../../packages/ui/src/assets/images/dog_small.png"

import {
  ApiError,
  clearAccessToken,
  getAccessToken,
  getSignupToken,
  setAccessToken,
} from "@/api/client"
import { getMyDogImageUploadUrl } from "@/api/dog"
import {
  courseDetailQueryOptions,
  createCourseMutationOptions,
  courseQueryKeys,
  deleteCourseMutationOptions,
  likeCourseMutationOptions,
  myCoursesQueryOptions,
  nearbyCoursesQueryOptions,
  replaceCoursePlacesMutationOptions,
  savedCoursesQueryOptions,
  saveCourseMutationOptions,
  shareCourseMutationOptions,
  unlikeCourseMutationOptions,
  updateCourseTitleMutationOptions,
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
  courseAfterRemovingSpots,
  courseDraftToApiRequest,
  nearbyCourseToFlowCourse,
  onboardingToDogCreate,
  sharedOwnedCoursesFromSummaries,
} from "./api-mappers"

import { AppShell } from "./app-shell"
import { useAppFlow } from "./app-flow-provider"
import {
  formatCourseCreatedAt,
  getBrowserCourseDateStorage,
  readCourseCreatedDates,
  saveCourseCreatedDate,
} from "./course-created-at-storage"
import { kakaoPlaceUrl } from "./place-links"
import {
  CourseGenerationScreen,
  GENERATION_MINIMUM_DURATION_MS,
  GENERATION_STEP_DURATION_MS,
} from "./course-generation-screen"
import {
  fallbackCoordinates,
  KakaoCourseMap,
  KakaoLocationPicker,
} from "./kakao-course-map"
import {
  communityCourses,
  courseThemes,
  isDogInfoComplete,
  isDogNameValid,
  isCourseDraftComplete,
  isValidCourseTimeRange,
  homePlacePreviews,
  minimumCourseEndTime,
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
  | "course-start-location"
  | "generating"
  | "course-detail"
  | "course-map"
  | "community"
  | "community-detail"
  | "community-save"
  | "archive"
  | "archive-detail"
  | "report"
  | "mypage"
  | "mypage-edit"
  | "error"

type CoursePickerField = "date" | "startTime" | "endTime"

const homePlaceCategories = ["식당", "산책", "카페", "액티비티"] as const

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
  mapReturnTo,
}: {
  screen: Screen
  courseId?: string
  term?: RequiredTermKey
  mapReturnTo?: "community" | "courses"
}) {
  const router = useRouter()
  const {
    courses,
    createCourse: createDemoCourse,
    addCourse,
    updateCourse: updateDemoCourse,
    removeCourse: removeDemoCourse,
    coordinates,
    courseStartCoordinates,
    courseDraft,
    dismissLocationPermissionPrompt,
    completeOnboarding,
    locationPermissionPromptOpen,
    onboarding,
    saveCourse,
    communityLikes,
    removedCommunityCourseIds,
    toggleCommunityLike,
    saveDiary,
    diaries,
    updateCourseDraft,
    updateCourseStartCoordinates,
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
  const initializedSaveCourseId = useRef<string | null>(null)
  const [generationAttempt, setGenerationAttempt] = useState(0)
  const [generationStep, setGenerationStep] = useState(0)
  const [generationMinimumElapsed, setGenerationMinimumElapsed] =
    useState(false)
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null)
  const [localCreatedDates, setLocalCreatedDates] =
    useState<Record<string, string>>(() =>
      readCourseCreatedDates(getBrowserCourseDateStorage())
    )
  const [generationRevealing, setGenerationRevealing] = useState(false)
  const dogHydrated = useRef(false)
  const homeLocationPromptShown = useRef(false)
  const [hasAccessToken, setHasAccessToken] = useState(false)
  const [homeLocationResolved, setHomeLocationResolved] = useState(demoMode)
  const [homeLocationUnavailable, setHomeLocationUnavailable] = useState(false)
  const [authConfigurationError, setAuthConfigurationError] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generationNoCandidates, setGenerationNoCandidates] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [onboardingNameFocused, setOnboardingNameFocused] = useState(false)
  const [birthYearMenuOpen, setBirthYearMenuOpen] = useState(false)
  const registerDog = useMutation(registerDogMutationOptions())
  const createApiCourse = useMutation(createCourseMutationOptions())
  const replaceCoursePlaces = useMutation(replaceCoursePlacesMutationOptions())
  const updateCourseTitle = useMutation(updateCourseTitleMutationOptions())
  const deleteApiCourse = useMutation(deleteCourseMutationOptions())
  const shareApiCourse = useMutation(shareCourseMutationOptions())
  const saveApiCourse = useMutation(saveCourseMutationOptions())
  const likeApiCourse = useMutation(likeCourseMutationOptions())
  const unlikeApiCourse = useMutation(unlikeCourseMutationOptions())
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
      radius_m: screen === "community" ? 20_000 : 3000,
      limit: screen === "community" ? 50 : 10,
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
  // The course summary omits is_shared, so inspect owned details to keep the
  // user's shared courses visible even when they fall outside the nearby radius.
  const mySharedCourseDetails = useQueries({
    queries: (myCourses.data ?? []).map((item) => ({
      ...courseDetailQueryOptions(String(item.course_id)),
      enabled: hasAccessToken && !demoMode && screen === "community",
    })),
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
        screen === "course-map" ||
        screen === "community-detail" ||
        screen === "community-save" ||
        screen === "archive-detail"),
  })
  const walkLogs = useQuery({
    ...walkLogsQueryOptions(),
    enabled:
      hasAccessToken &&
      !demoMode &&
      (screen === "archive" || screen === "archive-detail" || screen === "report"),
  })
  const [liveLike, setLiveLike] = useState<
    Record<string, { liked: boolean; count: number }>
  >({})
  const [saveDate, setSaveDate] = useState("")
  const [saveStartTime, setSaveStartTime] = useState("")
  const [saveEndTime, setSaveEndTime] = useState("")
  const [listOpen, setListOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)
  const [courseEditing, setCourseEditing] = useState(false)
  const [courseMenuOpen, setCourseMenuOpen] = useState(false)
  const [pendingCourseDeletion, setPendingCourseDeletion] = useState(false)
  const [pendingSpotRemoval, setPendingSpotRemoval] = useState<number | null>(
    null
  )
  const [removedCourseSpotIndexes, setRemovedCourseSpotIndexes] = useState<
    number[]
  >([])
  const [courseTitleDraft, setCourseTitleDraft] = useState("")
  const [editingCourseTitle, setEditingCourseTitle] = useState(false)
  const [courseActionError, setCourseActionError] = useState<string | null>(
    null
  )
  const [courseToast, setCourseToast] = useState<string | null>(null)
  const [age, setAge] = useState(user.age)
  const [dogName, setDogName] = useState(user.dogName)
  const [dogSize, setDogSize] = useState<"SMALL" | "MEDIUM" | "LARGE">("SMALL")
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [draftDiaries, setDraftDiaries] = useState<Record<string, string>>({})
  const [communityFilter, setCommunityFilter] = useState<
    "전체" | "소형" | "중형" | "대형"
  >("전체")
  const [courseListFilter, setCourseListFilter] = useState<
    "전체" | "내가 만든" | "내가 저장한"
  >("전체")
  const [coursePicker, setCoursePicker] = useState<CoursePickerField | null>(
    null
  )
  const [coursePickerValue, setCoursePickerValue] = useState("")
  const [pendingStartCoordinates, setPendingStartCoordinates] = useState(
    courseStartCoordinates ?? coordinates
  )
  const [pendingStartLocation, setPendingStartLocation] = useState(
    courseDraft.startLocation || "현재 위치"
  )
  const [homeCategory, setHomeCategory] = useState<
    "전체" | "식당" | "산책" | "카페" | "액티비티"
  >("전체")
  const shouldLoadHomePlaces =
    hasAccessToken &&
    !demoMode &&
    screen === "home" &&
    homeLocationResolved &&
    !homeLocationUnavailable
  const nearbyPlaces = useQuery({
    ...nearbyPlacesQueryOptions({
      lat: coordinates.lat,
      lng: coordinates.lng,
      category: homeCategory === "전체" ? "카페" : homeCategory,
      radius_m: 10_000,
      limit: 3,
    }),
    enabled: shouldLoadHomePlaces && homeCategory !== "전체",
  })
  const allNearbyPlaceQueries = useQueries({
    queries: homePlaceCategories.map((category) => ({
      ...nearbyPlacesQueryOptions({
        lat: coordinates.lat,
        lng: coordinates.lng,
        category,
        radius_m: 10_000,
        limit: 2,
      }),
      enabled: shouldLoadHomePlaces && homeCategory === "전체",
    })),
  })

  useEffect(() => {
    if (screen !== "home" || demoMode || !locationPermissionPromptOpen) return
    homeLocationPromptShown.current = true
  }, [demoMode, locationPermissionPromptOpen, screen])

  useEffect(() => {
    if (screen !== "new-course" || courseDraft.startLocation) return

    updateCourseDraft({ startLocation: "현재 위치" })
    if (!("geolocation" in navigator)) return

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        updateCoordinates({ lat: coords.latitude, lng: coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    )
  }, [
    courseDraft.startLocation,
    screen,
    updateCoordinates,
    updateCourseDraft,
  ])

  useEffect(() => {
    if (
      screen !== "home" ||
      demoMode ||
      !hasAccessToken ||
      locationPermissionPromptOpen ||
      homeLocationPromptShown.current ||
      homeLocationResolved
    ) {
      return
    }

    if (!("geolocation" in navigator)) {
      setHomeLocationUnavailable(true)
      setHomeLocationResolved(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        updateCoordinates({ lat: coords.latitude, lng: coords.longitude })
        setHomeLocationUnavailable(false)
        setHomeLocationResolved(true)
      },
      () => {
        setHomeLocationUnavailable(true)
        setHomeLocationResolved(true)
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 }
    )
  }, [
    demoMode,
    hasAccessToken,
    homeLocationResolved,
    locationPermissionPromptOpen,
    screen,
    updateCoordinates,
  ])

  const serverRecommendations = (nearbyCourses.data ?? []).map((item) =>
    nearbyCourseToFlowCourse(item, user.id)
  )
  const serverMyCourses = (myCourses.data ?? []).map((item) => {
    const course = nearbyCourseToFlowCourse(item, user.id)
    return {
      ...course,
      createdAt: course.createdAt ?? localCreatedDates[course.id],
    }
  })
  const serverOwnSharedCourses = sharedOwnedCoursesFromSummaries(
    myCourses.data ?? [],
    mySharedCourseDetails.map((query) => query.data),
    user.id
  )
  const serverSavedCourses = (savedCourses.data ?? []).map(
    (item) => nearbyCourseToFlowCourse(item, user.id)
  )
  const homePlaces =
    homeCategory === "전체"
      ? dedupeNearbyPlaces(
          allNearbyPlaceQueries.flatMap((query) => query.data ?? [])
        ).sort((left, right) => left.dist - right.dist)
      : (nearbyPlaces.data ?? [])
  const homePlacesPending =
    !homeLocationResolved ||
    (homeCategory === "전체"
      ? allNearbyPlaceQueries.some((query) => query.isPending)
      : nearbyPlaces.isPending)
  const homePlacesError =
    homeCategory === "전체"
      ? allNearbyPlaceQueries.every((query) => query.isError)
      : nearbyPlaces.isError
  const homeArea = findHomeArea(homePlaces[0]?.address)
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
    demoMode,
    removedCommunityCourseIds
  )
  const ownCourse = course?.userId === user.id
  const communityLike = course
    ? demoMode
      ? (communityLikes[course.id] ?? {
          liked: course.liked ?? false,
          count: course.likeCount ?? 0,
        })
      : (liveLike[course.id] ?? {
          liked: course.liked ?? false,
          count: course.likeCount ?? 0,
        })
    : { liked: false, count: 0 }
  const isCourseSaved = Boolean(
    course &&
      (course.saved ||
        ownCourse ||
        courses.some((item) => item.id === course.id && item.saved))
  )
  const courseMarkerPoints = course && course.placeDetails &&
    course.placeDetails.length === course.places.length &&
    course.placeDetails.every((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng))
      ? course.placeDetails.map((place) => ({ lat: place.lat!, lng: place.lng! }))
      : undefined
  const generationRequiresLogin =
    screen === "generating" && !demoMode && !hasAccessToken
  const generationDisplayError = generationRequiresLogin
    ? "코스를 만들려면 카카오 로그인이 필요합니다."
    : generationMinimumElapsed
      ? generationNoCandidates
        ? `${courseDraft.startLocation.trim() || "현재 위치"}에 적절한 코스가 없습니다.`
        : generationError
      : null
  const earliestCourseEndTime = minimumCourseEndTime(courseDraft.startTime)
  const invalidCoursePickerTime =
    coursePicker === "startTime"
      ? minimumCourseEndTime(coursePickerValue) === null
      : coursePicker === "endTime"
        ? !isValidCourseTimeRange(courseDraft.startTime, coursePickerValue)
        : false
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
    if (screen !== "generating") return

    const timers = [1, 2, 3].map((nextStep) =>
      window.setTimeout(
        () => setGenerationStep(nextStep),
        nextStep * GENERATION_STEP_DURATION_MS
      )
    )
    timers.push(
      window.setTimeout(
        () => setGenerationMinimumElapsed(true),
        GENERATION_MINIMUM_DURATION_MS
      )
    )

    return () => timers.forEach(window.clearTimeout)
  }, [generationAttempt, screen])

  useEffect(() => {
    if (screen !== "generating" || generationStarted.current) return
    generationStarted.current = true

    if (demoMode) {
      void Promise.resolve().then(() =>
        setGeneratedCourse(createDemoCourse(courseDraft))
      )
      return
    }

    if (!getAccessToken()) {
      return
    }

    void createApiCourse
      .mutateAsync(
        courseDraftToApiRequest(
          courseDraft,
          courseStartCoordinates ?? coordinates
        )
      )
      .then(async (result) => {
        const courseId = String(result.course_id)
        const createdAt = formatCourseCreatedAt(new Date())
        setLocalCreatedDates(
          saveCourseCreatedDate(
            getBrowserCourseDateStorage(),
            courseId,
            createdAt
          )
        )
        const finalized = await replaceCoursePlaces.mutateAsync({
          courseId,
          places: result.places,
          path: result.path,
          endedAt: `${courseDraft.date}T${courseDraft.endTime || "00:00"}:00+09:00`,
        })
        const generated = {
          ...apiCourseToFlowCourse(finalized, user.id),
          createdAt,
        }
        addCourse(generated)
        queryClient.invalidateQueries({ queryKey: courseQueryKeys.mine })
        setGeneratedCourse(generated)
      })
      .catch((error: Error) => {
        setGenerationNoCandidates(
          error instanceof ApiError &&
            error.status === 502 &&
            error.message.includes("최종 확정할 장소 후보가 없습니다.")
        )
        setGenerationError(error.message)
      })
  }, [
    addCourse,
    coordinates,
    courseStartCoordinates,
    courseDraft,
    createApiCourse,
    createDemoCourse,
    demoMode,
    generationAttempt,
    queryClient,
    replaceCoursePlaces,
    screen,
    user.id,
  ])

  useEffect(() => {
    if (
      screen !== "generating" ||
      !generationMinimumElapsed ||
      !generatedCourse ||
      generationError
    ) {
      return
    }

    const revealTimeout = window.setTimeout(
      () => setGenerationRevealing(true),
      0
    )
    const timeout = window.setTimeout(
      () => router.replace(`/courses/${generatedCourse.id}`),
      650
    )
    return () => {
      window.clearTimeout(revealTimeout)
      window.clearTimeout(timeout)
    }
  }, [
    generatedCourse,
    generationError,
    generationMinimumElapsed,
    router,
    screen,
  ])

  useEffect(() => {
    if (!courseToast) return
    const timeout = window.setTimeout(() => setCourseToast(null), 2_000)
    return () => window.clearTimeout(timeout)
  }, [courseToast])

  useEffect(() => {
    if (screen !== "community-save" || !course) return
    if (initializedSaveCourseId.current === course.id) return
    initializedSaveCourseId.current = course.id
    const today = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date())
    const date = course.date && course.date >= today ? course.date : today
    const start = course.startTime ?? "13:00"
    setSaveDate(date)
    setSaveStartTime(start)
    setSaveEndTime(
      course.endTime && isValidCourseTimeRange(start, course.endTime)
        ? course.endTime
        : (minimumCourseEndTime(start) ?? "14:00")
    )
  }, [course, screen])

  useEffect(() => {
    if (screen !== "course-detail" || !course || !ownCourse) return
    if (new URLSearchParams(window.location.search).get("edit") !== "1") return
    setCourseTitleDraft(course.title)
    setRemovedCourseSpotIndexes([])
    setCourseActionError(null)
    setCourseEditing(true)
  }, [course?.id, ownCourse, screen])

  useEffect(() => {
    if (screen !== "courses") return
    const filter = new URLSearchParams(window.location.search).get("filter")
    if (filter === "saved") setCourseListFilter("내가 저장한")
    else if (filter === "mine") setCourseListFilter("내가 만든")
  }, [screen])

  if (screen === "login") {
    return (
      <Plain>
        <section className="relative flex min-h-[inherit] flex-col bg-red-600 px-5 pt-40 pb-6">
          <div className="flex flex-col items-center text-center">
            <p className="type-body-r-16 text-gray-50">
              반려동물 맞춤 산책코스
            </p>
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
        <section className="relative h-[224px] shrink-0 overflow-hidden bg-gray-900 text-white">
          <div className="pointer-events-none absolute left-0 top-[-12px] flex h-[214px] w-[500px] items-center justify-center overflow-hidden">
            <Image
              src="/img/home-wave.svg"
              alt=""
              width={493}
              height={92}
              priority
              className="h-[92px] max-w-none w-[493px] rotate-[14.69deg] opacity-40"
            />
          </div>
          <Image
            src="/logo/home-logo.svg"
            alt="개동여지도"
            width={124}
            height={30}
            priority
            className="absolute left-7 top-2 h-[30px] w-[124px]"
          />
          <Image
            src={homeDogImage}
            alt="여행을 준비하는 반려견"
            width={206}
            height={260}
            priority
            className="pointer-events-none absolute left-[187px] top-[46px] h-[260px] w-[206px] object-contain object-left-bottom"
          />
          <div className="absolute left-5 top-[75px] flex flex-col items-start gap-6">
            <h1 className="type-head-sb-24 whitespace-pre-line tracking-[-0.01em]">
              오늘 <span className="text-red-600">{user.dogName}</span>랑
              <br />
              어디 놀러 갈까요?
            </h1>
            <Button
              className="type-body-sb-16 h-10 rounded-xl px-10"
              onClick={() => router.push("/courses/new")}
            >
              코스 만들기
            </Button>
          </div>
        </section>
        <section className="relative z-10 flex min-h-0 flex-1 flex-col border-t-2 border-gray-200 bg-white px-5">
          <div className="flex flex-col gap-2 py-5">
            <div className="flex items-center justify-between">
              <h2 className="type-head-sb-20 text-gray-900">동반 가능시설</h2>
              <span className="flex items-center gap-1 py-1 text-gray-200">
                <Icon name="location" className="size-4 opacity-[0.41]" />
                <span className="type-body-r-14">{homeArea}</span>
              </span>
            </div>
            <p className="text-[14px] leading-5 font-medium tracking-[0.5px] text-gray-400">
              {user.dogName}와 함께 갈 수 있어요!
            </p>
            <div
              className="flex gap-2 overflow-x-auto"
              role="group"
              aria-label="장소 카테고리"
            >
              {(["전체", "식당", "산책", "카페", "액티비티"] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`type-body-r-16 shrink-0 rounded-full px-3 py-1 transition-colors ${
                    homeCategory === category
                      ? "bg-gray-900 text-gray-50"
                      : "bg-gray-50 text-gray-200"
                  }`}
                  aria-pressed={homeCategory === category}
                  onClick={() => setHomeCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {demoMode ? (
              homePlacePreviews.map((place) => (
                <HomePlaceCard key={place.id} {...place} />
              ))
            ) : homeLocationUnavailable ? (
              <p className="type-body-r-14 text-gray-400">
                현재 위치를 허용하면 주변 동반 가능시설을 알려드려요.
              </p>
            ) : homePlacesPending ? (
              <div role="status" aria-label="주변 장소를 불러오는 중" className="space-y-3">
                <span className="sr-only">주변 장소를 불러오고 있어요.</span>
                {Array.from({ length: 3 }, (_, index) => (
                  <HomePlaceCardSkeleton key={index} />
                ))}
              </div>
            ) : homePlaces.length ? (
              homePlaces.slice(0, 3).map((place) => (
                <HomePlaceCard
                  key={place.content_id}
                  title={place.title}
                  category={place.category}
                  distance={`${(place.dist / 1000).toFixed(1)}km`}
                  companionLabel={place.pet_accompany_type ?? "반려견 동반"}
                  pawCount={Math.max(place.like_count, 0)}
                  imageUrl={normalizePlaceImage(place.image_url)}
                  lat={place.lat}
                  lng={place.lng}
                />
              ))
            ) : homePlacesError ? (
              <p className="type-body-r-14 text-gray-400">
                주변 동반 가능시설을 불러오지 못했어요.
              </p>
            ) : (
              <p className="type-body-r-14 text-gray-400">
                현재 위치 주변에서 동반 가능시설을 찾지 못했어요.
              </p>
            )}
          </div>
        </section>
        {locationPermissionPromptOpen ? (
          <div
            className="layout-mobile-overlay z-10 flex items-center justify-center bg-black/40 px-8"
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
                  onClick={() => {
                    setHomeLocationUnavailable(true)
                    setHomeLocationResolved(true)
                    dismissLocationPermissionPrompt()
                  }}
                >
                  아니요
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!("geolocation" in navigator)) {
                      setHomeLocationUnavailable(true)
                      setHomeLocationResolved(true)
                      dismissLocationPermissionPrompt()
                      return
                    }
                    navigator.geolocation.getCurrentPosition(({ coords }) => {
                      updateCoordinates({
                        lat: coords.latitude,
                        lng: coords.longitude,
                      })
                      setHomeLocationUnavailable(false)
                      setHomeLocationResolved(true)
                      dismissLocationPermissionPrompt()
                    }, () => {
                      setHomeLocationUnavailable(true)
                      setHomeLocationResolved(true)
                      dismissLocationPermissionPrompt()
                    })
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
        <Header title="내 코스" className="h-[60px] px-4 [&_h1]:text-xl" />
        <section className="relative flex min-h-[calc(100svh-8.5rem)] flex-col px-5 pb-24">
          <div className="flex gap-2 py-2" role="tablist" aria-label="코스 목록">
            {(["전체", "내가 만든", "내가 저장한"] as const).map((filter) => {
              const active = courseListFilter === filter
              const iconName =
                filter === "내가 만든"
                  ? active
                    ? "pawChipSelected"
                    : "pawChipDefault"
                  : filter === "내가 저장한"
                    ? active
                      ? "bookmarkChipSelected"
                      : "bookmarkChipDefault"
                    : null

              return (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`type-body-r-16 inline-flex items-center gap-1 rounded-full px-3 py-1 ${active ? "bg-gray-900 text-gray-50" : "bg-gray-100 text-gray-200"}`}
                  onClick={() => setCourseListFilter(filter)}
                >
                  {filter}
                  {iconName ? (
                    <Icon
                      name={iconName}
                      className="size-5"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
          {displayedCourses.filter((item) =>
            courseListFilter === "전체"
              ? true
              : courseListFilter === "내가 만든"
                ? item.userId === user.id
                : Boolean(item.saved && item.userId !== user.id)
          ).length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
              <EmptyState
                title={
                  courseListFilter === "내가 저장한"
                    ? "저장한 코스가 없어요"
                    : "아직 만든 코스가 없어요"
                }
                description="제로와 떠날 첫 여행 코스를 지금 만들어보세요"
              />
            </div>
          ) : (
            <div className="space-y-4 pb-3 pt-5">
                {displayedCourses
                  .filter((item) =>
                    courseListFilter === "전체"
                      ? true
                      : courseListFilter === "내가 만든"
                        ? item.userId === user.id
                        : Boolean(item.saved && item.userId !== user.id)
                  )
                  .map((item) => (
                  <button
                    className="w-full text-left"
                    key={item.id}
                    onClick={() => router.push(`/courses/${item.id}`)}
                  >
                    <CourseCard
                      title={item.title}
                      hours={item.duration / 60}
                      spots={item.placeCount ?? item.places.length}
                      createdAt={item.createdAt}
                    />
                  </button>
                  ))}
            </div>
          )}
          <Button
            size="fab"
            className="absolute right-5 bottom-4 bg-red-600 text-white hover:bg-red-700"
            onClick={() => router.push("/courses/new")}
          >
            코스 만들기
          </Button>
        </section>
      </AppShell>
    )

  if (screen === "new-course")
    return (
      <Plain>
        <form
          className="relative flex h-full min-h-full flex-col overflow-hidden bg-gray-50 pb-22"
          onSubmit={(event) => {
            event.preventDefault()
            const draftToCreate = {
              ...courseDraft,
              title:
                courseDraft.title.trim() || `${user.dogName}와 함께하는 산책`,
              duration: courseDraft.duration ?? 90,
            }
            if (!isCourseDraftComplete(draftToCreate)) return
            updateCourseDraft(draftToCreate)
            router.push("/courses/generating")
          }}
        >
          <div className="space-y-2.5">
            <Header title="코스 만들기" onBack={() => router.back()} />
            <p className="type-body-r-14 px-12 text-gray-400">
              {user.dogName}의 체형과 나이를 고려한 코스로 생성돼요!
            </p>
          </div>
          <div className="mt-5 space-y-5 px-5">
            <button
              type="button"
              className="flex h-18 w-full items-center justify-between rounded-xl bg-gray-100/40 px-5 py-4 text-left"
              onClick={() => {
                setCoursePicker("date")
                setCoursePickerValue(
                  courseDraft.date || new Date().toISOString().slice(0, 10)
                )
              }}
            >
              <span className="type-head-sb-18 text-gray-600">날짜</span>
              <span className="type-body-sb-16 text-gray-400">
                {formatCourseDate(courseDraft.date)}
              </span>
            </button>

            <section className="rounded-xl bg-gray-100/40 px-5 pb-4 pt-1">
              <div className="border-b border-gray-150 py-3">
                <h2 className="type-head-sb-18 text-gray-600">시간</h2>
              </div>
              <div className="mt-3 space-y-2">
                {(
                  [
                    ["시작 시간", "startTime"],
                    ["종료 시간", "endTime"],
                  ] as const
                ).map(([label, field]) => {
                  const { period, value } = getCourseTimeParts(courseDraft[field])

                  return (
                    <div
                      key={field}
                      className="flex items-center justify-between"
                    >
                      <span className="type-body-sb-14 text-gray-400">
                        {label}
                      </span>
                      <button
                        type="button"
                        aria-label={[label, period, value]
                          .filter(Boolean)
                          .join(" ")}
                        disabled={field === "endTime" && !earliestCourseEndTime}
                        className="inline-flex h-10 w-25 items-center justify-center rounded-xl bg-gray-50 px-4 shadow-[0_0_2px_var(--color-gray-100)] disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          setCoursePicker(field)
                          setCoursePickerValue(
                            courseDraft[field] ||
                              (field === "endTime"
                                ? earliestCourseEndTime ?? ""
                                : "13:00")
                          )
                        }}
                      >
                        <span className="type-body-r-14 inline-flex items-center gap-0.5 whitespace-nowrap text-gray-600">
                          {period ? <span>{period}</span> : null}
                          <span>{value}</span>
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>

            <button
              type="button"
              className="flex h-18 w-full items-center justify-between gap-3 rounded-xl bg-gray-100/40 px-5 py-4 text-left"
              onClick={() => router.push("/courses/new/start-location")}
            >
              <span className="type-head-sb-18 shrink-0 text-gray-600">
                출발 위치
              </span>
              <span className="flex min-w-0 items-center gap-2 text-right">
                {!courseStartCoordinates ? (
                  <span className="type-body-r-13 shrink-0 text-red-500">
                    현재위치
                  </span>
                ) : null}
                <span className="type-body-sb-16 min-w-0 truncate text-gray-400">
                  {courseDraft.startLocation || "출발 위치 선택"}
                </span>
              </span>
            </button>
          </div>

          <fieldset className="mt-4 space-y-3 px-8 py-4">
            <legend className="type-head-sb-18 text-gray-600">
              들르고 싶은 곳을 골라주세요!
            </legend>
            <div className="flex flex-wrap gap-2">
              {courseThemes.map((theme) => {
                const selected = courseDraft.themes.includes(theme)
                return (
                  <button
                    key={theme}
                    type="button"
                    aria-pressed={selected}
                    className={`type-body-r-16 h-8 rounded-full px-3 ${selected ? "bg-gray-900 text-gray-50" : "bg-gray-100 text-gray-200"}`}
                    onClick={() =>
                      updateCourseDraft({
                        themes: toggleCourseTheme(courseDraft.themes, theme),
                      })
                    }
                  >
                    {theme}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="absolute right-5 bottom-6 left-5">
            <Button
              variant="dark"
              size="full"
              type="submit"
              className="h-12 bg-gray-600 text-[18px] hover:bg-gray-600 active:bg-gray-600"
              disabled={
                !isCourseDraftComplete({
                  ...courseDraft,
                  title:
                    courseDraft.title.trim() ||
                    `${user.dogName}와 함께하는 산책`,
                  duration: courseDraft.duration ?? 90,
                })
              }
            >
              만들기
            </Button>
          </div>

          {coursePicker ? (
            <div
              className="absolute inset-0 z-50 flex items-end bg-black/40"
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-picker-title"
            >
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                aria-label="선택창 닫기"
                onClick={() => setCoursePicker(null)}
              />
              <section className="relative w-full rounded-t-3xl bg-white px-5 pt-6 pb-8 shadow-[0_-8px_24px_rgba(0,0,0,0.12)]">
                <div className="mb-5 flex items-center justify-between">
                  <h2 id="course-picker-title" className="type-head-sb-20">
                    {coursePicker === "date" ? "날짜 선택" : "시간 선택"}
                  </h2>
                  <button
                    type="button"
                    className="type-body-r-14 px-2 text-gray-400"
                    onClick={() => setCoursePicker(null)}
                  >
                    취소
                  </button>
                </div>
                <TextField
                  aria-label={coursePicker === "date" ? "날짜 선택" : "시간 선택"}
                  type={coursePicker === "date" ? "date" : "time"}
                  min={
                    coursePicker === "endTime"
                      ? earliestCourseEndTime ?? undefined
                      : undefined
                  }
                  max={coursePicker === "startTime" ? "22:59" : undefined}
                  className="h-14 rounded-xl border-gray-150 px-5 text-center"
                  state="completed"
                  value={coursePickerValue}
                  onChange={(event) => setCoursePickerValue(event.target.value)}
                  autoFocus
                />
                {coursePicker === "startTime" && invalidCoursePickerTime ? (
                  <p className="type-body-r-14 mt-3 text-red-600" role="alert">
                    시작 시간은 오후 10:59까지 선택해 주세요.
                  </p>
                ) : null}
                {coursePicker === "endTime" && invalidCoursePickerTime ? (
                  <p className="type-body-r-14 mt-3 text-red-600" role="alert">
                    종료 시간은 시작 시간보다 최소 1시간 뒤여야 해요.
                  </p>
                ) : null}
                <Button
                  type="button"
                  size="full"
                  className="mt-5"
                  disabled={!coursePickerValue || invalidCoursePickerTime}
                  onClick={() => {
                    if (coursePicker === "date") {
                      updateCourseDraft({ date: coursePickerValue })
                    } else if (coursePicker === "startTime") {
                      updateCourseDraft({
                        startTime: coursePickerValue,
                        endTime: isValidCourseTimeRange(
                          coursePickerValue,
                          courseDraft.endTime
                        )
                          ? courseDraft.endTime
                          : "",
                      })
                    } else {
                      updateCourseDraft({ endTime: coursePickerValue })
                    }
                    setCoursePicker(null)
                  }}
                >
                  확인
                </Button>
              </section>
            </div>
          ) : null}

        </form>
      </Plain>
    )

  if (screen === "course-start-location")
    return (
      <Plain>
        <section className="flex h-full min-h-full flex-col bg-gray-50">
          <Header title="출발 위치 선택" onBack={() => router.back()} />
          <div className="relative min-h-0 flex-1 px-5 pt-3 pb-5">
            <KakaoLocationPicker
              center={pendingStartCoordinates}
              selectedLabel={pendingStartLocation}
              onSelectLocation={(nextCoordinates, label) => {
                setPendingStartCoordinates(nextCoordinates)
                setPendingStartLocation(label)
                if (label === "현재 위치") updateCoordinates(nextCoordinates)
              }}
              className="h-full min-h-80 rounded-xl"
            />
          </div>
          <div className="border-t border-gray-100 bg-white px-5 pt-4 pb-6">
            <Button
              size="full"
              onClick={() => {
                updateCourseStartCoordinates(
                  pendingStartLocation === "현재 위치"
                    ? null
                    : pendingStartCoordinates
                )
                updateCourseDraft({ startLocation: pendingStartLocation })
                router.back()
              }}
            >
              이 위치로 설정
            </Button>
          </div>
        </section>
      </Plain>
    )

  if (screen === "generating")
    return (
      <CourseGenerationScreen
        dogName={user.dogName || "반려견"}
        step={generationStep}
        error={generationDisplayError}
        requiresLogin={generationRequiresLogin}
        noCandidates={generationNoCandidates}
        revealing={generationRevealing}
        completedCourse={generatedCourse}
        onChangeLocation={() => router.replace("/courses/new")}
        onRetry={() => {
          if (!demoMode && !getAccessToken()) {
            router.replace("/login")
            return
          }
          generationStarted.current = false
          setGenerationError(null)
          setGenerationNoCandidates(false)
          setGenerationStep(0)
          setGenerationMinimumElapsed(false)
          setGeneratedCourse(null)
          setGenerationRevealing(false)
          setGenerationAttempt((attempt) => attempt + 1)
        }}
      />
    )

  if (screen === "course-map") {
    const returnPath = mapReturnTo === "community"
      ? `/community/${courseId}`
      : `/courses/${courseId}`
    return (
      <Plain>
        <section className="relative h-full min-h-[inherit] bg-gray-100">
          {course ? (
            <KakaoCourseMap
              className="h-full min-h-[inherit] w-full"
              center={course.startCoordinates ?? fallbackCoordinates}
              path={course.path}
              places={course.places}
              markerPoints={courseMarkerPoints}
              onSelectPlace={(place, index) => {
                const detail = course.placeDetails?.[index]
                const position = detail?.lat === undefined || detail.lng === undefined
                  ? undefined
                  : { lat: detail.lat, lng: detail.lng }
                window.open(
                  kakaoPlaceUrl(place, position),
                  "_blank",
                  "noopener,noreferrer"
                )
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-5 text-center text-gray-500">
              {courseDetail.isPending ? "지도를 불러오고 있어요." : "코스를 찾을 수 없어요."}
            </div>
          )}
          <Header
            className="absolute inset-x-0 top-0 z-10 bg-white/90"
            title="코스 지도"
            onBack={() => router.push(returnPath)}
          />
          {course?.places.length ? (
            <div className="absolute right-4 bottom-5 left-4 rounded-xl bg-white/95 px-4 py-3 text-center text-sm text-gray-600 shadow-sm">
              지도에서 장소 마커를 누르면 카카오맵이 열려요.
            </div>
          ) : null}
        </section>
      </Plain>
    )
  }

  if (screen === "course-detail" && ownCourse && course) {
    const visiblePlaces = course.places
      .map((place, index) => ({ place, index }))
      .filter(({ index }) => !removedCourseSpotIndexes.includes(index))
    const dateLabel = course.date
      ? new Intl.DateTimeFormat("ko-KR", {
          month: "2-digit",
          day: "2-digit",
          weekday: "long",
        }).format(new Date(`${course.date}T00:00:00`))
      : "오늘의 추천 코스"

    const courseActionBusy =
      updateCourseTitle.isPending ||
      replaceCoursePlaces.isPending ||
      deleteApiCourse.isPending ||
      shareApiCourse.isPending

    const removeSpot = () => {
      if (pendingSpotRemoval === null) return
      setRemovedCourseSpotIndexes((previous) => [
        ...previous,
        pendingSpotRemoval,
      ])
      setPendingSpotRemoval(null)
      setCourseToast("스팟이 삭제되었습니다")
    }

    const saveCourseChanges = async () => {
      const title = courseTitleDraft.trim()
      if (!title) {
        setCourseActionError("코스 제목을 입력해 주세요.")
        return
      }
      setCourseActionError(null)
      try {
        if (demoMode) {
          updateDemoCourse(course.id, {
            title,
            places: visiblePlaces.map(({ place }) => place),
            placeDetails: visiblePlaces.map(
              ({ index }) => course.placeDetails?.[index] ?? { category: "ETC" }
            ),
          })
        } else {
          let updated = courseDetail.data
          if (!updated || String(updated.course_id) !== course.id) {
            throw new Error("코스 정보를 불러온 뒤 다시 시도해 주세요.")
          }
          if (title !== updated.title) {
            updated = await updateCourseTitle.mutateAsync({
              courseId: course.id,
              title,
            })
            queryClient.setQueryData(courseQueryKeys.detail(course.id), updated)
          }
          if (removedCourseSpotIndexes.length) {
            updated = await replaceCoursePlaces.mutateAsync({
              courseId: course.id,
              ...courseAfterRemovingSpots(updated, removedCourseSpotIndexes),
            })
            queryClient.setQueryData(courseQueryKeys.detail(course.id), updated)
          }
          addCourse(apiCourseToFlowCourse(updated, user.id))
          void queryClient.invalidateQueries({ queryKey: courseQueryKeys.mine })
        }
        setRemovedCourseSpotIndexes([])
        setEditingCourseTitle(false)
        setCourseEditing(false)
        setCourseToast("코스가 수정되었습니다")
      } catch (error) {
        setCourseActionError(
          error instanceof Error ? error.message : "코스를 수정하지 못했습니다."
        )
      }
    }

    const deleteCourse = async () => {
      setCourseActionError(null)
      try {
        if (!demoMode) {
          await deleteApiCourse.mutateAsync(course.id)
          queryClient.removeQueries({ queryKey: courseQueryKeys.detail(course.id) })
          void queryClient.invalidateQueries({ queryKey: courseQueryKeys.mine })
          void queryClient.invalidateQueries({
            queryKey: ["courses", "nearby"],
          })
        }
        removeDemoCourse(course.id)
        setPendingCourseDeletion(false)
        router.replace("/courses")
      } catch (error) {
        setCourseActionError(
          error instanceof Error ? error.message : "코스를 삭제하지 못했습니다."
        )
      }
    }

    const shareCourse = async () => {
      setCourseMenuOpen(false)
      setCourseActionError(null)
      try {
        if (demoMode) {
          updateDemoCourse(course.id, { shared: true })
        } else {
          const updated = await shareApiCourse.mutateAsync(course.id)
          queryClient.setQueryData(courseQueryKeys.detail(course.id), updated)
          void queryClient.invalidateQueries({ queryKey: courseQueryKeys.mine })
          void queryClient.invalidateQueries({
            queryKey: ["courses", "nearby"],
          })
        }
        setCourseToast("코스가 공유되었습니다")
      } catch (error) {
        setCourseActionError(
          error instanceof Error ? error.message : "코스를 공유하지 못했습니다."
        )
      }
    }

    if (!courseEditing) {
      return (
        <Plain>
          <section className="min-h-[inherit] bg-gray-900 text-gray-50">
            <div className="relative h-84 overflow-hidden">
              <KakaoCourseMap
                className="size-full"
                center={course.startCoordinates ?? fallbackCoordinates}
                path={course.path}
                places={course.places}
                markerPoints={courseMarkerPoints}
                onSelectPlace={setSelectedPlace}
                dark
              />
              <button
                type="button"
                className="absolute inset-x-0 top-0 z-[1] h-56"
                aria-label="지도 전체 보기"
                onClick={() => router.push(`/courses/${course.id}/map`)}
              />
              <Image
                src={smallDogImage}
                alt=""
                width={88}
                height={71}
                className="pointer-events-none absolute top-[167px] left-[10px] h-[71px] w-[88px]"
              />
              <Header
                className="absolute inset-x-0 top-0 z-[2] bg-gradient-to-b from-gray-900/70 to-transparent [&_img]:invert"
                title={undefined}
                onBack={() => router.push("/courses")}
              />
            </div>
            <section className="relative -mt-28 min-h-[calc(100svh-14rem)] space-y-5 rounded-t-2xl bg-gray-900 px-5 py-6">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="type-head-sb-22 text-gray-50">
                      {course.title}
                    </h1>
                    <Chip variant="dark">예정</Chip>
                  </div>
                  <p className="type-body-r-14 text-gray-500">{dateLabel}</p>
                </div>
                <div className="relative shrink-0">
                  <Button
                    aria-label="코스 메뉴"
                    aria-expanded={courseMenuOpen}
                    aria-haspopup="menu"
                    variant="text"
                    size="sm"
                    className="size-6 p-0 text-gray-50 hover:bg-transparent"
                    onClick={() => setCourseMenuOpen((open) => !open)}
                  >
                    <Icon name="more" className="size-6 invert" />
                  </Button>
                  {courseMenuOpen ? (
                    <>
                      <button
                        type="button"
                        aria-label="코스 메뉴 닫기"
                        className="fixed inset-0 z-20 cursor-default"
                        onClick={() => setCourseMenuOpen(false)}
                      />
                      <div
                        role="menu"
                        aria-label="코스 관리"
                        className="absolute top-6 right-0 z-30 flex flex-col items-end gap-2"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className="type-body-r-16 whitespace-nowrap rounded-lg bg-gray-600 px-4 py-2 text-gray-100 shadow-[0_0_5px_rgba(91,91,91,0.4)] hover:bg-gray-500"
                          onClick={() => {
                            setCourseMenuOpen(false)
                            setCourseTitleDraft(course.title)
                            setRemovedCourseSpotIndexes([])
                            setCourseActionError(null)
                            setCourseEditing(true)
                          }}
                        >
                          수정하기
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="type-body-r-16 whitespace-nowrap rounded-lg bg-gray-600 px-4 py-2 text-gray-100 shadow-[0_0_5px_rgba(91,91,91,0.4)] hover:bg-gray-500"
                          onClick={() => {
                            setCourseMenuOpen(false)
                            setPendingCourseDeletion(true)
                          }}
                        >
                          삭제하기
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="type-body-r-16 whitespace-nowrap rounded-lg bg-gray-600 px-4 py-2 text-gray-100 shadow-[0_0_5px_rgba(91,91,91,0.4)] hover:bg-gray-500"
                          onClick={() => void shareCourse()}
                        >
                          공유하기
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
              {courseActionError ? (
                <p className="type-body-r-14 text-red-500" role="alert">
                  {courseActionError}
                </p>
              ) : null}
              <section aria-label="코스 스팟" className="space-y-0">
                {visiblePlaces.map(({ place, index }) => (
                  <TimelineSpot
                    key={`${course.id}-${index}`}
                    title={place}
                    time={
                      course.placeDetails?.[index]?.visitTime
                        ? formatVisitTime(course.placeDetails[index].visitTime)
                        : formatCourseSpotTime(course.startTime, index)
                    }
                    chip={
                      course.placeDetails?.[index]
                        ? formatPlaceCategory(
                            course.placeDetails[index].category
                          )
                        : "장소"
                    }
                    variant="dark-course"
                  />
                ))}
              </section>
              {selectedPlace ? (
                <section
                  className="rounded-2xl bg-gray-800 p-4"
                  role="dialog"
                  aria-label="스팟 상세"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="type-body-sb-16 text-gray-50">
                        {selectedPlace}
                      </p>
                      <p className="type-body-r-14 mt-1 text-gray-400">
                        반려견과 함께 방문하기 좋은 코스 스팟이에요.
                      </p>
                    </div>
                    <Button
                      variant="text"
                      size="sm"
                      className="text-gray-50 hover:bg-gray-700"
                      onClick={() => setSelectedPlace(null)}
                    >
                      닫기
                    </Button>
                  </div>
                </section>
              ) : null}
            </section>
            {courseToast ? (
              <p
                className="type-body-r-16 absolute right-5 bottom-6 left-5 mx-auto w-fit rounded-full bg-gray-600 px-4 py-2 text-gray-50"
                role="status"
              >
                {courseToast}
              </p>
            ) : null}
            {pendingCourseDeletion ? (
              <div
                className="layout-mobile-overlay z-40 flex items-center justify-center bg-black/60 px-5"
                role="dialog"
                aria-modal="true"
                aria-label="코스 삭제 확인"
              >
                <section className="w-full rounded-2xl bg-gray-800 p-4 text-center">
                  <h2 className="type-head-sb-24 text-gray-50">
                    코스를 삭제할까요?
                  </h2>
                  <p className="type-body-r-16 mt-2 text-gray-400">
                    삭제한 코스는 다시 되돌릴 수 없어요.
                  </p>
                  {courseActionError ? (
                    <p
                      className="type-body-r-14 mt-3 text-red-500"
                      role="alert"
                    >
                      {courseActionError}
                    </p>
                  ) : null}
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <Button
                      size="lg"
                      variant="dark"
                      className="h-13 w-full bg-gray-600 px-4 hover:bg-gray-600"
                      disabled={courseActionBusy}
                      onClick={() => setPendingCourseDeletion(false)}
                    >
                      유지하기
                    </Button>
                    <Button
                      size="lg"
                      className="h-13 w-full bg-red-500 px-4 hover:bg-red-500"
                      disabled={courseActionBusy}
                      onClick={() => void deleteCourse()}
                    >
                      삭제하기
                    </Button>
                  </div>
                </section>
              </div>
            ) : null}
          </section>
        </Plain>
      )
    }

    return (
      <Plain>
        <section className="relative flex min-h-[inherit] flex-col bg-gray-900 text-gray-50">
          <Header
            className="shrink-0 bg-gray-900 text-gray-50 [&_img]:invert"
            title={undefined}
            onBack={() => {
              setCourseEditing(false)
              setEditingCourseTitle(false)
              setRemovedCourseSpotIndexes([])
              setCourseActionError(null)
            }}
          />
          <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 pt-6 pb-28">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                {editingCourseTitle ? (
                  <input
                    aria-label="코스 제목"
                    data-ui="course-title"
                    type="text"
                    autoFocus
                    maxLength={80}
                    value={courseTitleDraft}
                    onChange={(event) =>
                      setCourseTitleDraft(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.currentTarget.blur()
                        setEditingCourseTitle(false)
                      }
                    }}
                    className="type-head-sb-24 min-w-20 max-w-[calc(100%_-_40px)] flex-none border-0 border-b border-red-500 bg-gray-800 px-3 py-1 text-gray-50 [field-sizing:content]"
                  />
                ) : (
                  <h1 className="type-head-sb-24 min-w-0 py-1 text-gray-50">
                    {courseTitleDraft || course.title}
                  </h1>
                )}
                <Button
                  aria-label="코스 제목 수정"
                  variant="text"
                  size="sm"
                  className="size-6 shrink-0 p-0 hover:bg-transparent"
                  onClick={() => setEditingCourseTitle(true)}
                >
                  <Icon name="editRed" className="size-6" />
                </Button>
              </div>
              <p className="type-body-r-14 text-gray-500">{dateLabel}</p>
              {courseActionError ? (
                <p className="type-body-r-14 text-red-500" role="alert">
                  {courseActionError}
                </p>
              ) : null}
            </div>

            {visiblePlaces.length ? (
              <section aria-label="코스 스팟" className="space-y-0">
                {visiblePlaces.map(({ place, index }) => (
                  <TimelineSpot
                    key={`${course.id}-${index}`}
                    title={place}
                    time={
                      course.placeDetails?.[index]?.visitTime
                        ? formatVisitTime(course.placeDetails[index].visitTime)
                        : formatCourseSpotTime(course.startTime, index)
                    }
                    chip={
                      course.placeDetails?.[index]
                        ? formatPlaceCategory(
                            course.placeDetails[index].category
                          )
                        : "장소"
                    }
                    variant="dark-edit"
                    onRemove={() => setPendingSpotRemoval(index)}
                  />
                ))}
              </section>
            ) : (
              <div className="rounded-2xl border border-gray-600 bg-gray-800 px-5 py-6">
                <p className="type-body-sb-16 text-gray-150">
                  남아 있는 스팟이 없어요
                </p>
                <p className="type-body-r-14 mt-1 text-gray-400">
                  새 코스를 만들어 제로와 다시 떠나 보세요.
                </p>
              </div>
            )}
          </main>

          <div className="absolute inset-x-0 bottom-0 bg-gray-900 px-5 pt-3 pb-6">
            <Button
              size="full"
              variant="secondary"
              className="border-0 bg-gray-50 text-gray-900 hover:bg-white"
              disabled={courseActionBusy || !courseTitleDraft.trim()}
              onClick={() => void saveCourseChanges()}
            >
              수정하기
            </Button>
          </div>

          {courseToast ? (
            <p
              className="type-body-r-16 absolute inset-x-0 bottom-24 mx-auto w-fit rounded-full bg-gray-600 px-4 py-2 text-gray-50"
              role="status"
            >
              {courseToast}
            </p>
          ) : null}

          {pendingSpotRemoval !== null ? (
            <div
              className="layout-mobile-overlay z-10 flex items-center justify-center bg-black/60 px-5"
              role="dialog"
              aria-modal="true"
              aria-label="스팟 삭제 확인"
            >
              <section className="w-full rounded-2xl bg-gray-800 shadow-[0_0_1px_var(--color-gray-400)]">
                <div className="space-y-3 px-4 py-5 text-center">
                  <div>
                    <h2 className="type-head-sb-24 text-gray-50">
                      스팟을 삭제할까요?
                    </h2>
                    <p className="type-body-r-16 mt-1 text-gray-400">
                      스팟을 삭제하면 삭제된 코스로 재조정돼요!
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-gray-400 bg-gray-600 px-5 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <p className="type-body-sb-16 text-gray-150">
                        {course.places[pendingSpotRemoval]}
                      </p>
                      <Chip variant="dark">
                        {course.placeDetails?.[pendingSpotRemoval]
                          ? formatPlaceCategory(
                              course.placeDetails[pendingSpotRemoval].category
                            )
                          : "장소"}
                      </Chip>
                    </div>
                    <p className="type-body-r-13 mt-2 text-gray-400">
                      {formatCourseSpotTime(
                        course.startTime,
                        pendingSpotRemoval
                      )}
                      {" ~ "}
                      {formatCourseSpotTime(
                        course.startTime,
                        pendingSpotRemoval + 1
                      )}
                      {" 방문 예정"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                  <Button
                    size="lg"
                    variant="dark"
                    className="h-13 w-full bg-gray-600 px-4 hover:bg-gray-600"
                    onClick={() => setPendingSpotRemoval(null)}
                  >
                    유지하기
                  </Button>
                  <Button
                    size="lg"
                    className="h-13 w-full bg-red-500 px-4 hover:bg-red-500"
                    onClick={removeSpot}
                  >
                    삭제하기
                  </Button>
                </div>
              </section>
            </div>
          ) : null}
        </section>
      </Plain>
    )
  }

  if ((screen === "community-detail" || screen === "community-save") && !course) {
    return (
      <Plain>
        <Header title="커뮤니티" onBack={() => router.push("/community")} />
        <p className="type-body-r-14 px-5 py-6 text-gray-500">
          {courseDetail.isPending ? "코스를 불러오고 있어요." : "코스를 찾을 수 없어요."}
        </p>
      </Plain>
    )
  }

  if (screen === "community-save") {
    const canSave = Boolean(saveDate) && isValidCourseTimeRange(saveStartTime, saveEndTime)
    const handleSave = () => {
      if (!course || !canSave) return
      setCourseActionError(null)
      if (demoMode) {
        saveCourse({ ...course, date: saveDate, startTime: saveStartTime, endTime: saveEndTime })
        router.replace("/courses?filter=saved")
        return
      }
      saveApiCourse.mutate(course.id, {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: courseQueryKeys.saved })
          void queryClient.invalidateQueries({ queryKey: ["courses", "nearby"] })
          void queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(course.id) })
          router.replace("/courses?filter=saved")
        },
        onError: (error) =>
          setCourseActionError(error instanceof Error ? error.message : "코스를 저장하지 못했어요."),
      })
    }
    return (
      <Plain>
        <section className="flex min-h-[inherit] flex-col bg-gray-50">
          <Header title="코스 만들기" onBack={() => router.push(`/community/${courseId}`)} />
          <p className="type-body-r-14 px-12 text-gray-400">
            {user.dogName}의 체형과 나이를 고려한 코스로 생성돼요!
          </p>
          <div className="mt-5 space-y-5 px-5">
            <label className="flex h-18 items-center justify-between rounded-xl bg-gray-100/40 px-5">
              <span className="type-head-sb-18 text-gray-600">날짜</span>
              <input
                aria-label="저장할 코스 날짜"
                type="date"
                value={saveDate}
                onChange={(event) => setSaveDate(event.target.value)}
                className="type-body-sb-16 w-36 border-0 bg-transparent text-right text-gray-400 outline-none focus:outline-none focus:ring-0"
              />
            </label>
            <section className="rounded-xl bg-gray-100/40 px-5 pb-4 pt-1">
              <h2 className="type-head-sb-18 border-b border-gray-150 py-3 text-gray-600">시간</h2>
              <div className="mt-3 space-y-2">
                <label className="flex items-center justify-between">
                  <span className="type-body-sb-14 text-gray-400">시작 시간</span>
                  <input
                    aria-label="저장할 코스 시작 시간"
                    type="time"
                    value={saveStartTime}
                    max="22:59"
                    onChange={(event) => {
                      const start = event.target.value
                      setSaveStartTime(start)
                      if (!isValidCourseTimeRange(start, saveEndTime)) {
                        setSaveEndTime(minimumCourseEndTime(start) ?? "")
                      }
                    }}
                    className="type-body-r-14 h-10 w-27 rounded-xl border-0 bg-gray-50 px-2 text-center text-gray-600 shadow-[0_0_2px_var(--color-gray-100)] outline-none focus:outline-none focus:ring-0"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="type-body-sb-14 text-gray-400">종료 시간</span>
                  <input
                    aria-label="저장할 코스 종료 시간"
                    type="time"
                    value={saveEndTime}
                    min={minimumCourseEndTime(saveStartTime) ?? undefined}
                    disabled={!minimumCourseEndTime(saveStartTime)}
                    onChange={(event) => setSaveEndTime(event.target.value)}
                    className="type-body-r-14 h-10 w-27 rounded-xl border-0 bg-gray-50 px-2 text-center text-gray-600 shadow-[0_0_2px_var(--color-gray-100)] outline-none focus:outline-none focus:ring-0 disabled:opacity-50"
                  />
                </label>
              </div>
            </section>
            {!canSave && saveStartTime && saveEndTime ? (
              <p className="type-body-r-14 text-red-600" role="alert">
                종료 시간은 시작 시간보다 최소 1시간 뒤여야 해요.
              </p>
            ) : null}
            {courseActionError ? <p className="type-body-r-14 text-red-600" role="alert">{courseActionError}</p> : null}
          </div>
          <div className="mt-auto px-5 pb-6 pt-5">
            <Button
              size="full"
              variant="dark"
              className="h-14 bg-gray-600 text-[18px] hover:bg-gray-600"
              disabled={!course || !canSave || saveApiCourse.isPending}
              onClick={handleSave}
            >
              {saveApiCourse.isPending ? "저장 중" : "코스 저장하기"}
            </Button>
          </div>
        </section>
      </Plain>
    )
  }

  if (screen === "community-detail" && course) {
    const toggleLike = () => {
      if (demoMode) {
        toggleCommunityLike(course)
        return
      }
      const mutation = communityLike.liked ? unlikeApiCourse : likeApiCourse
      mutation.mutate(course.id, {
        onSuccess: (result) => {
          setLiveLike((previous) => ({
            ...previous,
            [course.id]: { liked: result.is_liked, count: result.like_count },
          }))
          void queryClient.invalidateQueries({ queryKey: ["courses", "nearby"] })
          void queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(course.id) })
        },
        onError: (error) =>
          setCourseActionError(error instanceof Error ? error.message : "좋아요를 변경하지 못했어요."),
      })
    }
    const deleteSharedCourse = async () => {
      setCourseActionError(null)
      try {
        if (demoMode) {
          removeDemoCourse(course.id)
        } else {
          await deleteApiCourse.mutateAsync(course.id)
          queryClient.removeQueries({ queryKey: courseQueryKeys.detail(course.id) })
          void queryClient.invalidateQueries({ queryKey: courseQueryKeys.mine })
          void queryClient.invalidateQueries({ queryKey: ["courses", "nearby"] })
        }
        router.replace("/community")
      } catch (error) {
        setCourseActionError(error instanceof Error ? error.message : "코스를 삭제하지 못했어요.")
      }
    }
    const shareLink = async () => {
      setCourseMenuOpen(false)
      const url = `${window.location.origin}/community/${course.id}`
      try {
        if (navigator.share) {
          await navigator.share({ title: course.title, url })
        } else {
          await navigator.clipboard.writeText(url)
          setCourseToast("코스 링크를 복사했어요")
        }
      } catch {
        setCourseActionError("공유 링크를 복사하지 못했어요.")
      }
    }
    return (
      <Plain>
        <section className="flex min-h-[inherit] flex-col bg-white">
          <div className="relative isolate h-84 shrink-0 overflow-hidden">
            <KakaoCourseMap
              className="relative z-0 size-full"
              center={course.startCoordinates ?? fallbackCoordinates}
              path={course.path}
              places={course.places}
              markerPoints={courseMarkerPoints}
              onSelectPlace={setSelectedPlace}
            />
            <button
              type="button"
              className="absolute inset-x-0 top-0 z-10 h-56"
              aria-label="지도 전체 보기"
              onClick={() => router.push(`/community/${course.id}/map`)}
            />
            <Header
              className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-white/80 to-transparent"
              title={undefined}
              onBack={() => router.push("/community")}
            />
            {ownCourse ? (
              <span className="type-body-r-14 absolute bottom-32 left-5 z-20 inline-flex items-center gap-0.5 rounded-full bg-black/50 px-3 py-1 text-white">
                <span
                  aria-hidden="true"
                  className="size-5 bg-white"
                  style={{ mask: `url(${iconSources.pawFill}) center / contain no-repeat` }}
                />
                내가 만든 코스
              </span>
            ) : null}
          </div>
          <section className="relative z-10 -mt-28 flex flex-1 flex-col rounded-t-[20px] bg-white px-5 pt-6 pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <h1 className="type-head-sb-22 text-gray-800">{course.title}</h1>
                {communityLike.count > 0 ? (
                  <PawActivity count={communityLike.count} />
                ) : (
                  <p className="type-body-r-14 text-gray-500">아직 발자국을 남긴 친구가 없어요</p>
                )}
              </div>
              {ownCourse ? (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    aria-label="코스 메뉴"
                    aria-haspopup="menu"
                    aria-expanded={courseMenuOpen}
                    className="flex size-7 items-center justify-center"
                    onClick={() => setCourseMenuOpen((open) => !open)}
                  >
                    <Icon name="more" className="size-7" />
                  </button>
                  {courseMenuOpen ? (
                    <>
                      <button type="button" aria-label="코스 메뉴 닫기" className="fixed inset-0 z-20" onClick={() => setCourseMenuOpen(false)} />
                      <div role="menu" aria-label="코스 관리" className="absolute right-0 top-8 z-30 flex min-w-24 flex-col gap-2 rounded-lg bg-gray-50 px-4 py-2 text-right shadow-[0_0_5px_rgba(201,198,198,0.6)]">
                        <button type="button" role="menuitem" className="type-body-r-16 whitespace-nowrap text-gray-500" onClick={() => void shareLink()}>공유하기</button>
                        <button type="button" role="menuitem" className="type-body-r-16 whitespace-nowrap text-gray-500" onClick={() => router.push(`/courses/${course.id}?edit=1`)}>수정하기</button>
                        <button type="button" role="menuitem" className="type-body-r-16 whitespace-nowrap text-red-600" onClick={() => { setCourseMenuOpen(false); setPendingCourseDeletion(true) }}>삭제하기</button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : (
                <span
                  role="img"
                  aria-label={isCourseSaved ? "저장한 코스" : "저장하지 않은 코스"}
                  className={`size-7 shrink-0 ${isCourseSaved ? "bg-red-800" : "bg-gray-150"}`}
                  style={{ mask: `url(${iconSources[isCourseSaved ? "bookmarkFill" : "bookmarkLine"]}) center / contain no-repeat` }}
                />
              )}
            </div>
            <section aria-label="코스 스팟" className="mt-8">
              {course.places.map((place, index) => (
                <TimelineSpot
                  key={`${course.id}-${index}`}
                  title={place}
                  time={course.placeDetails?.[index]?.visitTime
                    ? formatVisitTime(course.placeDetails[index].visitTime)
                    : formatCourseSpotTime(course.startTime, index)}
                  chip={course.placeDetails?.[index]
                    ? formatPlaceCategory(course.placeDetails[index].category)
                    : "장소"}
                  variant="light-default"
                />
              ))}
              {!course.places.length ? (
                <p className="type-body-r-14 py-5 text-gray-400">
                  {courseDetail.isPending ? "장소를 불러오고 있어요." : "등록된 장소가 없어요."}
                </p>
              ) : null}
            </section>
            {courseActionError ? <p role="alert" className="type-body-r-14 mt-3 text-red-600">{courseActionError}</p> : null}
            {courseToast ? <p role="status" className="type-body-r-14 mt-3 text-gray-500">{courseToast}</p> : null}
            {!ownCourse ? (
              <div className="sticky bottom-0 z-10 -mx-5 mt-auto flex items-center gap-3 bg-gradient-to-b from-white/0 via-white to-white px-5 pt-10 pb-6">
                <LikeButton
                  aria-label="코스 좋아요"
                  pressed={communityLike.liked}
                  disabled={likeApiCourse.isPending || unlikeApiCourse.isPending}
                  onClick={toggleLike}
                />
                <Button
                  size="full"
                  variant="dark"
                  className="h-[54px] flex-1 bg-gray-600 text-[18px] hover:bg-gray-600"
                  onClick={() => router.push(isCourseSaved ? "/courses?filter=saved" : `/community/${course.id}/save`)}
                >
                  {isCourseSaved ? "저장한 코스 보기" : "내 코스로 저장"}
                </Button>
              </div>
            ) : null}
          </section>
          {pendingCourseDeletion ? (
            <div className="layout-mobile-overlay z-40 flex items-center justify-center bg-black/60 px-5" role="dialog" aria-modal="true" aria-label="코스 삭제 확인">
              <section className="w-full rounded-2xl bg-white p-5 text-center">
                <h2 className="type-head-sb-22 text-gray-900">코스를 삭제할까요?</h2>
                <p className="type-body-r-14 mt-2 text-gray-500">삭제한 코스는 다시 되돌릴 수 없어요.</p>
                {courseActionError ? <p role="alert" className="type-body-r-14 mt-2 text-red-600">{courseActionError}</p> : null}
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="lg" className="px-3" onClick={() => setPendingCourseDeletion(false)}>유지하기</Button>
                  <Button size="lg" className="px-3" disabled={deleteApiCourse.isPending} onClick={() => void deleteSharedCourse()}>삭제하기</Button>
                </div>
              </section>
            </div>
          ) : null}
        </section>
      </Plain>
    )
  }

  if (
    screen === "course-detail" ||
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
            markerPoints={courseMarkerPoints}
            onSelectPlace={setSelectedPlace}
          />
          {screen === "course-detail" ? (
            <button
              type="button"
              className="absolute inset-x-0 top-0 z-[1] h-56"
              aria-label="지도 전체 보기"
              onClick={() => router.push(`/courses/${course.id}/map`)}
            />
          ) : null}
          <Header
            className="absolute inset-x-0 top-0 z-[2] bg-gradient-to-b from-gray-900/80 to-transparent text-white [&_svg]:text-white"
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
        </section>
      </Plain>
    )
  }

  if (screen === "community") {
    const sharedCourses = demoMode
      ? dedupeCourses([
          ...courses.filter((item) => item.shared),
          ...communityCourses.filter((item) => !removedCommunityCourseIds.includes(item.id)),
        ])
      : dedupeCourses([...serverOwnSharedCourses, ...serverRecommendations])
    const visibleCourses = sharedCourses.filter(
      (item) => communityFilter === "전체" || !item.dogSize || item.dogSize === communityFilter
    )
    return (
      <AppShell tab="community">
        <Header title="커뮤니티" className="h-[60px] px-4 [&_h1]:text-xl" />
        <section className="flex min-h-[calc(100%-60px)] flex-col px-5 pb-5">
          <div className="flex gap-2 py-2" role="group" aria-label="반려견 크기 필터">
            {(["전체", "대형", "중형", "소형"] as const).map((filter) => (
              <Chip
                key={filter}
                variant="light"
                className={`h-8 rounded-full px-3 text-[16px] font-normal ${communityFilter === filter ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-200"}`}
                onClick={() => setCommunityFilter(filter)}
                aria-pressed={communityFilter === filter}
              >
                {filter}
              </Chip>
            ))}
          </div>
          {!demoMode && visibleCourses.length === 0 && (
            nearbyCourses.isPending ||
            (hasAccessToken && (myCourses.isPending || mySharedCourseDetails.some((query) => query.isPending)))
          ) ? (
            <p className="type-body-r-14 mt-9 text-gray-400">공유된 코스를 불러오고 있어요.</p>
          ) : !demoMode && visibleCourses.length === 0 && nearbyCourses.isError ? (
            <div className="mt-9 space-y-3">
              <p className="type-body-r-14 text-gray-400">공유된 코스를 불러오지 못했어요.</p>
              <Button variant="secondary" size="sm" onClick={() => void nearbyCourses.refetch()}>다시 불러오기</Button>
            </div>
          ) : visibleCourses.length === 0 ? (
            <div className="flex flex-1 items-center justify-center pb-16">
              <EmptyState
                title="아직 등록된 코스가 없어요"
                description="내 코스를 등록해볼까요?"
              />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {visibleCourses.map((item) => {
                const isSaved = item.userId === user.id || item.saved || courses.some((savedCourse) => savedCourse.id === item.id && savedCourse.saved)
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left"
                    onClick={() => router.push(`/community/${item.id}`)}
                  >
                    <CourseCard
                      className="max-w-none"
                      title={item.title}
                      hours={Math.round(item.duration / 60 * 10) / 10}
                      spots={item.placeCount ?? item.places.length}
                      activityCount={communityLikes[item.id]?.count ?? item.likeCount ?? 0}
                      saved={Boolean(isSaved)}
                      variant={item.userId === user.id ? "community-y" : "community-n"}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </AppShell>
    )
  }

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
        <section className="min-h-full bg-gray-50 pb-6">
          <header className="flex h-[60px] items-center px-4">
            <h1 className="type-head-sb-20 text-gray-900">마이페이지</h1>
          </header>
          <div className="flex flex-col items-center px-5">
            <Image
              src={profileImageSrc}
              alt={`${user.dogName} 프로필`}
              width={100}
              height={100}
              unoptimized={profileImageSrc.startsWith("http")}
              className="size-[100px] rounded-[40px] object-cover"
            />
            <div className="mt-3 flex items-center gap-[7px]">
              <h2 className="type-head-sb-20 text-gray-900">{user.dogName}</h2>
              <Button
                size="sm"
                variant="secondary"
                className="h-[26px] rounded-full border border-gray-100 bg-white px-3 text-gray-900"
                onClick={() => router.push("/mypage/edit")}
              >
                수정
              </Button>
            </div>
          </div>
          <div className="space-y-5 px-5">
            <dl className="mt-5 grid grid-cols-3 rounded-2xl border border-gray-800 bg-gray-500 px-4 py-3 text-center">
              <div className="space-y-1">
                <dt className="type-body-sb-14 text-gray-50">몸무게</dt>
                <dd className="type-body-r-16 text-gray-200">10kg이하</dd>
              </div>
              <div className="space-y-1">
                <dt className="type-body-sb-14 text-gray-50">나이</dt>
                <dd className="type-body-r-16 text-gray-200">{user.age.replace(/살$/, "세")}</dd>
              </div>
              <div className="space-y-1">
                <dt className="type-body-sb-14 text-gray-50">견종</dt>
                <dd className="type-body-r-16 text-gray-200">{activeDogSizeLabel}</dd>
              </div>
            </dl>
            <section className="rounded-xl bg-white px-5 py-3">
              <h2 className="type-body-sb-16 border-b border-gray-100 py-2">설정</h2>
              <ListRow label="이용약관" onClick={() => router.push("/terms/service")} />
              <ListRow label="개인정보 처리방침" onClick={() => router.push("/terms/privacy")} />
            </section>
            <section className="rounded-xl bg-white px-5 py-3">
              <h2 className="type-body-sb-16 border-b border-gray-100 py-2">계정관리</h2>
              <ListRow
                label="로그아웃"
                onClick={() => {
                  clearAccessToken()
                  router.replace("/login")
                }}
              />
            </section>
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
      <section className="flex min-h-[inherit] flex-col items-center justify-center gap-2 bg-gray-50 px-5 text-center">
        <Image
          src="/img/empty-state-404.png"
          alt="문제를 확인하는 반려견"
          width={184}
          height={131}
          className="mb-2 h-[131px] w-[184px] object-contain"
        />
        <h1 className="type-head-sb-18">알 수 없는 에러가 발생했습니다</h1>
        <p className="type-body-r-14 text-gray-300">다시 시작해주세요</p>
        <Button className="mt-5 px-10" onClick={() => router.back()}>
          돌아가기
        </Button>
      </section>
    </Plain>
  )
}

function Plain({ children }: { children: React.ReactNode }) {
  return <main className="layout-mobile bg-white">{children}</main>
}

function dedupeNearbyPlaces<T extends { content_id: string }>(places: T[]) {
  return Array.from(
    new Map(places.map((place) => [place.content_id, place])).values()
  )
}

function findHomeArea(address?: string) {
  return address?.split(/\s+/).find((part) => part.endsWith("구")) ?? "내 주변"
}

function formatCourseDate(date: string) {
  return date ? date.replaceAll("-", ".") : "날짜 선택"
}

function getCourseTimeParts(time: string) {
  if (!time) return { period: "", value: "시간 선택" }

  const [hourValue, minute = "00"] = time.split(":")
  const hour = Number(hourValue)
  const period = hour < 12 ? "오전" : "오후"
  const displayHour = String(hour % 12 || 12).padStart(2, "0")

  return { period, value: `${displayHour} : ${minute}` }
}

function formatCourseSpotTime(startTime: string | undefined, index: number) {
  const [rawHour, rawMinute] = (startTime ?? "10:00").split(":").map(Number)
  const totalMinutes = (rawHour ?? 10) * 60 + (rawMinute ?? 0) + index * 60
  const hour = Math.floor(totalMinutes / 60) % 24
  const minute = totalMinutes % 60
  const period = hour < 12 ? "오전" : "오후"
  const displayHour = hour % 12 || 12
  return `${period} ${displayHour} : ${String(minute).padStart(2, "0")}`
}

function formatVisitTime(visitTime: string) {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(new Date(visitTime))
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""
  return `${value("dayPeriod")} ${value("hour")} : ${value("minute")}`
}

function formatPlaceCategory(category: string) {
  const labels: Record<string, string> = {
    PARK: "산책",
    CAFE: "카페",
    RESTAURANT: "식당",
    HOSPITAL: "동물병원",
    PET_SHOP: "반려동물 용품",
    ETC: "장소",
  }
  return labels[category] ?? "장소"
}

function normalizePlaceImage(imageUrl: string | null) {
  return imageUrl?.replace(/^http:/, "https:") ?? "/img/home-place.png"
}

function HomePlaceCard({
  title,
  category,
  distance,
  companionLabel,
  pawCount,
  imageUrl,
  lat,
  lng,
}: {
  title: string
  category: string
  distance: string
  companionLabel: string
  pawCount: number
  imageUrl: string
  lat?: number
  lng?: number
}) {
  return (
    <a
      href={kakaoPlaceUrl(title, lat === undefined || lng === undefined ? undefined : { lat, lng })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${title} 카카오맵에서 보기`}
      className="flex min-h-[104px] items-center justify-between gap-3 rounded-[20px] border border-gray-100 bg-gray-50/50 px-4 py-3"
    >
      <div className="min-w-0 flex-1">
        <h3 className="type-body-sb-16 truncate text-gray-600">{title}</h3>
        <div className="mt-3 flex flex-col gap-1">
          <div className="type-body-r-13 flex min-w-0 items-center gap-1 text-gray-200">
            <span className="shrink-0 rounded-full bg-red-50 px-2 text-red-700">
              {companionLabel}
            </span>
            <span className="truncate">{category}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{distance}</span>
          </div>
          <p className="type-body-r-13 flex items-center gap-1 text-gray-200">
            <Icon name="pawFill" className="size-5" />
            {pawCount}마리의 친구들이 발자국을 남겼어요!
          </p>
        </div>
      </div>
      <Image
        src={imageUrl}
        alt=""
        width={76}
        height={76}
        unoptimized
        className="size-19 shrink-0 rounded-xl object-cover"
      />
    </a>
  )
}

function HomePlaceCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-[104px] items-center justify-between gap-3 rounded-[20px] border border-gray-100 bg-gray-50/50 px-4 py-3"
    >
      <div className="min-w-0 flex-1 animate-pulse space-y-3 motion-reduce:animate-none">
        <div className="h-5 w-3/4 rounded-md bg-gray-150/60" />
        <div className="space-y-1.5">
          <div className="h-4 w-full rounded-md bg-gray-100" />
          <div className="h-4 w-4/5 rounded-md bg-gray-100" />
        </div>
      </div>
      <div className="size-19 shrink-0 animate-pulse rounded-xl bg-gray-150/60 motion-reduce:animate-none" />
    </div>
  )
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
  includeDemoCourses: boolean,
  removedCommunityCourseIds: string[] = []
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
      ? communityCourses.find(
          (item) => item.id === id && !removedCommunityCourseIds.includes(item.id)
        )
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
