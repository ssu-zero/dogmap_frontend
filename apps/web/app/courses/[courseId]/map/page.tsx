"use client"

import { FlowScreen } from "@/features/app-flow/flow-screen"
import { useParams } from "next/navigation"

export default function Page() {
  const params = useParams<{ courseId: string }>()
  return (
    <FlowScreen
      screen="course-map"
      courseId={params.courseId}
      mapReturnTo="courses"
    />
  )
}
