import { mutationOptions, queryOptions } from "@tanstack/react-query"

import { createCourse, getNearbyCourses } from "@/api/course"
import type { NearbyCoursesParams } from "@/schema/course"

export const courseQueryKeys = {
  nearby: (params: NearbyCoursesParams) =>
    ["courses", "nearby", params] as const,
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
