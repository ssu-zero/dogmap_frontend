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
  식당: "FOOD",
  산책: "WALK",
  카페: "CAFE",
  액티비티: "ACTIVITY",
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
    walk_date: `${draft.date}T${draft.startTime || "00:00"}:00+09:00`,
  }
}

export function apiCourseToFlowCourse(
  course: ApiCourse,
  userId: string
): Course {
  const walkDate = course.walk_date ? new Date(course.walk_date) : null
  return {
    id: String(course.course_id),
    userId: course.is_owner ? userId : "other",
    title: course.title,
    duration: Math.round(course.total_duration_minutes),
    places: course.places.map((place) => place.name),
    placeDetails: course.places.map((place) => ({
      category: place.category,
      visitTime: place.visit_time,
    })),
    date: walkDate
      ? new Intl.DateTimeFormat("sv-SE", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(walkDate)
      : undefined,
    startTime: walkDate
      ? new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Seoul",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(walkDate)
      : undefined,
    saved: course.is_saved,
    shared: course.is_shared,
    path: course.path,
    startCoordinates: { lat: course.start_lat, lng: course.start_lng },
  }
}

export function nearbyCourseToFlowCourse(
  course: NearbyCourse,
  currentUserId = "zero"
): Course {
  return {
    id: String(course.course_id),
    userId: course.is_owner ? currentUserId : "nearby",
    title: course.title,
    duration: course.total_duration_minutes,
    places: [],
    startCoordinates: { lat: course.start_lat, lng: course.start_lng },
    summaryOnly: true,
    placeCount: course.place_count,
    saved: course.is_saved,
  }
}

/** The places API trusts the client to rebuild the route after a stop is removed. */
export function courseAfterRemovingSpots(
  course: ApiCourse,
  removedIndexes: number[]
) {
  const remaining = course.places.filter(
    (_, index) => !removedIndexes.includes(index)
  )
  const path: [number, number][] = [
    [course.start_lat, course.start_lng],
    ...remaining.map((place): [number, number] => [place.lat, place.lng]),
  ]
  const places = remaining.map((place, index) => {
    const [fromLat, fromLng] = path[index] ?? [
      course.start_lat,
      course.start_lng,
    ]
    const distanceMeters = Math.round(
      straightLineMeters(fromLat, fromLng, place.lat, place.lng)
    )

    return {
      ...place,
      sequence: index + 1,
      travel_distance_meters: distanceMeters,
      travel_minutes: Math.ceil(distanceMeters / 75),
      visit_time: null,
    }
  })

  return { places, path }
}

function straightLineMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  const radians = Math.PI / 180
  const latitudeDelta = (toLat - fromLat) * radians
  const longitudeDelta = (toLng - fromLng) * radians
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLat * radians) *
      Math.cos(toLat * radians) *
      Math.sin(longitudeDelta / 2) ** 2
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a))
}
