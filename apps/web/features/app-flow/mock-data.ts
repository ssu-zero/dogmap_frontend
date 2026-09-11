export type Course = {
  id: string
  userId: string
  title: string
  duration: number
  places: string[]
  saved?: boolean
  edge?: boolean
  date?: string
  startTime?: string
  endTime?: string
  dogSize?: "소형" | "중형" | "대형"
  path?: [number, number][]
  startCoordinates?: { lat: number; lng: number }
  summaryOnly?: boolean
  placeCount?: number
}

export const courseDurations = [60, 90, 120] as const
export type CourseDuration = (typeof courseDurations)[number]

export const courseThemes = ["산책", "카페", "활동"] as const
export type CourseTheme = (typeof courseThemes)[number]

export type CourseDraft = {
  title: string
  date: string
  startTime: string
  endTime: string
  startLocation: string
  duration: CourseDuration | null
  themes: CourseTheme[]
}

export const initialCourseDraft: CourseDraft = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  startLocation: "",
  duration: null,
  themes: [],
}

export function isCourseDraftComplete(draft: CourseDraft) {
  return (
    Boolean(draft.title.trim()) &&
    Boolean(draft.date) &&
    Boolean(draft.startTime) &&
    Boolean(draft.endTime) &&
    Boolean(draft.startLocation.trim()) &&
    Boolean(draft.duration) &&
    draft.themes.length > 0
  )
}

export function toggleCourseTheme(themes: CourseTheme[], theme: CourseTheme) {
  return themes.includes(theme)
    ? themes.filter((item) => item !== theme)
    : [...themes, theme]
}

export const currentUser = {
  id: "zero",
  name: "제로와 보호자",
  dogName: "제로",
  age: "3살",
}

export const requiredTermKeys = ["service", "privacy", "location"] as const
export type RequiredTermKey = (typeof requiredTermKeys)[number]

export const termsContent: Record<
  RequiredTermKey,
  { title: string; body: string }
> = {
  service: {
    title: "서비스 이용약관",
    body: "개동여지도는 반려동물과 함께할 수 있는 장소와 코스를 탐색할 수 있도록 돕습니다.\n\n서비스 이용과 코스 추천에 관한 필수 안내를 확인해 주세요.",
  },
  privacy: {
    title: "개인정보 처리방침",
    body: "개동여지도는 서비스 제공과 맞춤 코스 추천을 위해 필요한 정보를 안전하게 처리합니다.\n\n개인정보 처리 목적과 보관 기준을 확인해 주세요.",
  },
  location: {
    title: "위치 기반 서비스 이용약관",
    body: "현재 위치 정보는 출발지 주변의 반려견 동반 장소와 산책 코스를 추천하는 데 사용됩니다.\n\n위치 정보 이용 범위와 권한 설정 방법을 확인해 주세요.",
  },
}

export type OnboardingProfile = {
  dogName: string
  dogSize: "small" | "medium" | "large" | null
  birthYear: string
}

export const initialOnboardingProfile: OnboardingProfile = {
  dogName: "",
  dogSize: null,
  birthYear: "",
}

export function isDogNameValid(dogName: string) {
  return dogName.trim().length >= 1 && dogName.trim().length <= 20
}

export function isDogInfoComplete(profile: OnboardingProfile) {
  return Boolean(profile.dogSize && /^20\d{2}$/.test(profile.birthYear))
}

export const communityCourses: Course[] = [
  {
    id: "seoul-forest",
    userId: "mango",
    title: "서울숲 반려견 산책 코스",
    duration: 90,
    places: ["서울숲", "댕댕이 카페", "성수 산책길"],
    dogSize: "소형",
  },
  {
    id: "zero-weekend",
    userId: "zero",
    title: "제로의 주말 한강 코스",
    duration: 120,
    places: ["망원 한강공원", "반려견 놀이터", "망원시장"],
    dogSize: "중형",
  },
]
