import type {
  Course as ApiCourse,
  CourseCreateRequest,
  NearbyCourse,
} from "@/schema/course"
import type { DogCreateRequest, DogSize } from "@/schema/dog"

import type { Course, CourseDraft, OnboardingProfile } from "./mock-data"

const dogSizeByOnboardingValue: Record<
  NonNullable<OnboardingProfile["dogSize"]>,
  DogSize
> = {
  small: "SMALL",
  medium: "MEDIUM",
  large: "LARGE",
}

const categoryByTheme = {
  산책: "WALK",
  카페: "CAFE",
  활동: "ACTIVITY",
} as const

export type Coordinates = {
  lat: number
  lng: number
}

// The product's current wireframe labels Iksan Station as the fallback start.
// Browser geolocation replaces this value as soon as the user grants permission.
export const DEFAULT_START_COORDINATES: Coordinates = {
  lat: 35.9402,
  lng: 126.9463,
}

export function onboardingToDogCreate(
  profile: OnboardingProfile,
  currentYear = new Date().getFullYear()
): DogCreateRequest {
  if (!profile.dogSize) {
    throw new Error("반려견 크기가 필요합니다.")
  }

  return {
    name: profile.dogName.trim(),
    size: dogSizeByOnboardingValue[profile.dogSize],
    age: Math.max(0, currentYear - Number(profile.birthYear)),
    image_url: null,
  }
}

export function courseDraftToApiRequest(
  draft: CourseDraft,
  coordinates: Coordinates
): CourseCreateRequest {
  if (!draft.duration || draft.themes.length === 0) {
    throw new Error("코스 생성 조건이 필요합니다.")
  }

  return {
    start_lat: coordinates.lat,
    start_lng: coordinates.lng,
    target_duration_minutes: draft.duration,
    category_targets: draft.themes.map((theme) => ({
      category: categoryByTheme[theme],
      count: 1,
    })),
    title: draft.title.trim(),
  }
}

export function apiCourseToFlowCourse(
  course: ApiCourse,
  userId: string
): Course {
  return {
    id: String(course.course_id),
    userId,
    title: course.title,
    duration: Math.round(course.total_duration_minutes),
    places: course.places.map((place) => place.name),
    path: course.path,
    startCoordinates: { lat: course.start_lat, lng: course.start_lng },
  }
}

export function nearbyCourseToFlowCourse(course: NearbyCourse): Course {
  return {
    id: String(course.course_id),
    userId: "nearby",
    title: course.title,
    duration: course.total_duration_minutes,
    places: [],
    startCoordinates: { lat: course.start_lat, lng: course.start_lng },
    summaryOnly: true,
    placeCount: course.place_count,
  }
}
