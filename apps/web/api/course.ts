import { apiClient, parseResponse } from "@/api/client"
import {
  courseCreateRequestSchema,
  courseSchema,
  nearbyCoursesParamsSchema,
  nearbyCoursesSchema,
  type CourseCreateRequest,
  type NearbyCoursesParams,
} from "@/schema/course"

export async function getNearbyCourses(input: NearbyCoursesParams) {
  const params = nearbyCoursesParamsSchema.parse(input)

  return parseResponse(
    apiClient.get("api/v1/courses", { searchParams: params }),
    nearbyCoursesSchema
  )
}

export async function createCourse(input: CourseCreateRequest) {
  return parseResponse(
    apiClient.post("api/v1/courses", {
      json: courseCreateRequestSchema.parse(input),
    }),
    courseSchema
  )
}
