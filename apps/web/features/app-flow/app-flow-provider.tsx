"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  currentUser,
  initialCourseDraft,
  initialOnboardingProfile,
  type Course,
  type CourseDraft,
  type OnboardingProfile,
  type RequiredTermKey,
} from "./mock-data"

type TermsAgreement = Record<RequiredTermKey, boolean>

type AppFlowState = {
  user: typeof currentUser
  courses: Course[]
  terms: TermsAgreement
  termsAgreed: boolean
  onboarding: OnboardingProfile
  courseDraft: CourseDraft
  coordinates: { lat: number; lng: number }
  courseStartCoordinates: { lat: number; lng: number } | null
  diaries: Record<string, string>
  communityLikes: Record<string, { liked: boolean; count: number }>
  removedCommunityCourseIds: string[]
  updateUser: (updates: Partial<typeof currentUser>) => void
  createCourse: (draft: CourseDraft) => Course
  addCourse: (course: Course) => void
  updateCourse: (courseId: string, updates: Partial<Course>) => void
  removeCourse: (courseId: string) => void
  saveCourse: (course: Course) => void
  toggleCommunityLike: (course: Course) => void
  setTerm: (term: RequiredTermKey, value: boolean) => void
  setAllTerms: (value: boolean) => void
  updateOnboarding: (updates: Partial<OnboardingProfile>) => void
  completeOnboarding: () => void
  updateCoordinates: (coordinates: { lat: number; lng: number }) => void
  updateCourseStartCoordinates: (coordinates: { lat: number; lng: number } | null) => void
  updateCourseDraft: (updates: Partial<CourseDraft>) => void
  saveDiary: (courseId: string, body: string) => void
}

const AppFlowContext = createContext<AppFlowState | null>(null)

function AppFlowProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(currentUser)
  const [courses, setCourses] = useState<Course[]>([])
  const [terms, setTerms] = useState<TermsAgreement>({
    service: false,
    privacy: false,
    location: false,
  })
  const [onboarding, setOnboarding] = useState(initialOnboardingProfile)
  const [courseDraft, setCourseDraft] = useState(initialCourseDraft)
  const [coordinates, setCoordinates] = useState({
    lat: 35.9402,
    lng: 126.9463,
  })
  const [courseStartCoordinates, setCourseStartCoordinates] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [diaries, setDiaries] = useState<Record<string, string>>({})
  const [communityLikes, setCommunityLikes] = useState<
    Record<string, { liked: boolean; count: number }>
  >({})
  const [removedCommunityCourseIds, setRemovedCommunityCourseIds] = useState<string[]>([])

  const value = useMemo<AppFlowState>(
    () => ({
      user,
      courses,
      terms,
      termsAgreed: Object.values(terms).every(Boolean),
      onboarding,
      courseDraft,
      coordinates,
      courseStartCoordinates,
      diaries,
      communityLikes,
      removedCommunityCourseIds,
      updateUser: (updates) =>
        setUser((previous) => ({ ...previous, ...updates })),
      createCourse: (draft) => {
        const course: Course = {
          id: `generated-${Date.now()}`,
          userId: user.id,
          title: draft.title.trim() || `${user.dogName}와 함께하는 산책`,
          createdAt: new Intl.DateTimeFormat("sv-SE", {
            timeZone: "Asia/Seoul",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date()).replaceAll("-", "."),
          duration: draft.duration ?? 90,
          places: [
            draft.startLocation.trim(),
            ...(draft.themes.includes("카페")
              ? ["반려견 동반 카페"]
              : []),
            ...(draft.themes.includes("액티비티") ? ["반려견 놀이터"] : []),
            "휴식 스팟",
          ],
          date: draft.date,
          startTime: draft.startTime,
          endTime: draft.endTime,
          startCoordinates: courseStartCoordinates ?? coordinates,
        }
        setCourses((previous) => [course, ...previous])
        return course
      },
      addCourse: (course) =>
        setCourses((previous) => [
          course,
          ...previous.filter((item) => item.id !== course.id),
        ]),
      updateCourse: (courseId, updates) =>
        setCourses((previous) =>
          previous.map((course) =>
            course.id === courseId ? { ...course, ...updates } : course
          )
        ),
      removeCourse: (courseId) => {
        setCourses((previous) =>
          previous.filter((course) => course.id !== courseId)
        )
        setRemovedCommunityCourseIds((previous) =>
          previous.includes(courseId) ? previous : [...previous, courseId]
        )
      },
      saveCourse: (course) =>
        setCourses((previous) =>
          previous.some((item) => item.id === course.id)
            ? previous.map((item) =>
                item.id === course.id
                  ? {
                      ...item,
                      saved: true,
                      date: course.date,
                      startTime: course.startTime,
                      endTime: course.endTime,
                    }
                  : item
              )
            : [{ ...course, saved: true }, ...previous]
        ),
      toggleCommunityLike: (course) =>
        setCommunityLikes((previous) => {
          const current = previous[course.id] ?? {
            liked: course.liked ?? false,
            count: course.likeCount ?? 0,
          }
          return {
            ...previous,
            [course.id]: {
              liked: !current.liked,
              count: Math.max(0, current.count + (current.liked ? -1 : 1)),
            },
          }
        }),
      setTerm: (term, value) =>
        setTerms((previous) => ({ ...previous, [term]: value })),
      setAllTerms: (value) =>
        setTerms({ service: value, privacy: value, location: value }),
      updateOnboarding: (updates) =>
        setOnboarding((previous) => ({ ...previous, ...updates })),
      completeOnboarding: () => {
        setUser((previous) => ({
          ...previous,
          dogName: onboarding.dogName.trim(),
        }))
      },
      updateCoordinates: setCoordinates,
      updateCourseStartCoordinates: setCourseStartCoordinates,
      updateCourseDraft: (updates) =>
        setCourseDraft((previous) => ({ ...previous, ...updates })),
      saveDiary: (courseId, body) =>
        setDiaries((previous) => ({ ...previous, [courseId]: body.trim() })),
    }),
    [
      courseDraft,
      coordinates,
      courseStartCoordinates,
      diaries,
      communityLikes,
      removedCommunityCourseIds,
      courses,
      onboarding,
      terms,
      user,
    ]
  )

  return (
    <AppFlowContext.Provider value={value}>{children}</AppFlowContext.Provider>
  )
}

function useAppFlow() {
  const context = useContext(AppFlowContext)
  if (!context)
    throw new Error("useAppFlow must be used within AppFlowProvider")
  return context
}

export { AppFlowProvider, useAppFlow }
