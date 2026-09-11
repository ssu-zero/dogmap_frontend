"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { currentUser, type Course } from "./mock-data"

type AppFlowState = {
  user: typeof currentUser
  courses: Course[]
  termsAgreed: boolean
  draftTitle: string
  updateUser: (updates: Partial<typeof currentUser>) => void
  createCourse: (title: string) => Course
  saveCourse: (course: Course) => void
  setTermsAgreed: (value: boolean) => void
  setDraftTitle: (value: string) => void
}

const AppFlowContext = createContext<AppFlowState | null>(null)

function AppFlowProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(currentUser)
  const [courses, setCourses] = useState<Course[]>([])
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [draftTitle, setDraftTitle] = useState("제로와 함께하는 주말 산책")

  const value = useMemo<AppFlowState>(
    () => ({
      user,
      courses,
      termsAgreed,
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
      setTermsAgreed,
      setDraftTitle,
    }),
    [courses, draftTitle, termsAgreed, user]
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
