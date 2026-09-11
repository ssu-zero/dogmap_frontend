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
  initialOnboardingProfile,
  type Course,
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
  locationPermissionPromptOpen: boolean
  draftTitle: string
  updateUser: (updates: Partial<typeof currentUser>) => void
  createCourse: (title: string) => Course
  saveCourse: (course: Course) => void
  setTerm: (term: RequiredTermKey, value: boolean) => void
  setAllTerms: (value: boolean) => void
  updateOnboarding: (updates: Partial<OnboardingProfile>) => void
  completeOnboarding: () => void
  dismissLocationPermissionPrompt: () => void
  setDraftTitle: (value: string) => void
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
  const [locationPermissionPromptOpen, setLocationPermissionPromptOpen] =
    useState(false)
  const [draftTitle, setDraftTitle] = useState("제로와 함께하는 주말 산책")

  const value = useMemo<AppFlowState>(
    () => ({
      user,
      courses,
      terms,
      termsAgreed: Object.values(terms).every(Boolean),
      onboarding,
      locationPermissionPromptOpen,
      draftTitle,
      updateUser: (updates) =>
        setUser((previous) => ({ ...previous, ...updates })),
      createCourse: (title) => {
        const course: Course = {
          id: `generated-${Date.now()}`,
          userId: user.id,
          title,
          duration: 80,
          places: ["출발지 주변 공원", "반려견 동반 카페", "휴식 스팟"],
        }
        setCourses((previous) => [course, ...previous])
        return course
      },
      saveCourse: (course) =>
        setCourses((previous) =>
          previous.some((item) => item.id === course.id)
            ? previous
            : [{ ...course, saved: true }, ...previous]
        ),
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
        setLocationPermissionPromptOpen(true)
      },
      dismissLocationPermissionPrompt: () =>
        setLocationPermissionPromptOpen(false),
      setDraftTitle,
    }),
    [courses, draftTitle, locationPermissionPromptOpen, onboarding, terms, user]
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
