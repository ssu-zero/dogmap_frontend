import { apiClient, parseResponse } from "@/api/client"
import {
  courseCreateRequestSchema,
  coursePlacesReplaceRequestSchema,
  courseSaveStatusSchema,
  courseSchema,
  myCoursesSchema,
  nearbyCoursesParamsSchema,
  nearbyCoursesSchema,
  type CourseCreateRequest,
  type CoursePlacesReplaceRequest,
  type NearbyCoursesParams,
} from "@/schema/course"

export async function getNearbyCourses(input: NearbyCoursesParams) {
  const params = nearbyCoursesParamsSchema.parse(input)

  return parseResponse(
    apiClient.get("api/courses", { searchParams: params }),
    nearbyCoursesSchema
  )
}

export async function createCourse(input: CourseCreateRequest) {
  return parseResponse(
    apiClient.post("api/courses", {
      json: courseCreateRequestSchema.parse(input),
      timeout: 120_000,
    }),
    courseSchema
  )
}

export function getCourse(courseId: string) {
  return parseResponse(apiClient.get(`api/courses/${courseId}`), courseSchema)
}

export function getMyCourses() {
  return parseResponse(apiClient.get("api/dogs/me/courses"), myCoursesSchema)
}

export function getSavedCourses() {
  return parseResponse(apiClient.get("api/saves"), myCoursesSchema)
}

export function saveCourse(courseId: string) {
  return parseResponse(
    apiClient.post(`api/courses/${courseId}/save`),
    courseSaveStatusSchema
  )
}

export function unsaveCourse(courseId: string) {
  return parseResponse(
    apiClient.delete(`api/courses/${courseId}/save`),
    courseSaveStatusSchema
  )
}

export function replaceCoursePlaces(
  courseId: string,
  input: CoursePlacesReplaceRequest
) {
  return parseResponse(
    apiClient.put(`api/courses/${courseId}/places`, {
      json: coursePlacesReplaceRequestSchema.parse(input),
    }),
    courseSchema
  )
}
