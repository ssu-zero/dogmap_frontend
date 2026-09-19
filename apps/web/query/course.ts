import { mutationOptions, queryOptions } from "@tanstack/react-query"

import {
  createCourse,
  getCourse,
  getMyCourses,
  getNearbyCourses,
  getSavedCourses,
  saveCourse,
  unsaveCourse,
} from "@/api/course"
import type { NearbyCoursesParams } from "@/schema/course"

export const courseQueryKeys = {
  nearby: (params: NearbyCoursesParams) =>
    ["courses", "nearby", params] as const,
  detail: (courseId: string) => ["courses", "detail", courseId] as const,
  mine: ["courses", "mine"] as const,
  saved: ["courses", "saved"] as const,
}

export const nearbyCoursesQueryOptions = (params: NearbyCoursesParams) =>
  queryOptions({
    queryKey: courseQueryKeys.nearby(params),
    queryFn: () => getNearbyCourses(params),
  })

export const createCourseMutationOptions = () =>
  mutationOptions({
    mutationKey: ["courses", "create"],
    mutationFn: createCourse,
  })

export const courseDetailQueryOptions = (courseId: string) =>
  queryOptions({
    queryKey: courseQueryKeys.detail(courseId),
    queryFn: () => getCourse(courseId),
  })

export const myCoursesQueryOptions = () =>
  queryOptions({
    queryKey: courseQueryKeys.mine,
    queryFn: getMyCourses,
  })

export const savedCoursesQueryOptions = () =>
  queryOptions({
    queryKey: courseQueryKeys.saved,
    queryFn: getSavedCourses,
  })

export const saveCourseMutationOptions = () =>
  mutationOptions({
    mutationKey: ["courses", "save"],
    mutationFn: saveCourse,
  })

export const unsaveCourseMutationOptions = () =>
  mutationOptions({
    mutationKey: ["courses", "unsave"],
    mutationFn: unsaveCourse,
  })
