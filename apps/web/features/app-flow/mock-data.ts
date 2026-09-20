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

export const homePlacePreviews = [
  {
    id: "home-coffee-tree-1",
    title: "커피나무 숭실대점",
    category: "카페",
    distance: "1.3km",
    companionLabel: "소형견 동반",
    pawCount: 6,
    imageUrl: "/img/home-place.png",
  },
  {
    id: "home-coffee-tree-2",
    title: "커피나무 숭실대점",
    category: "카페",
    distance: "1.3km",
    companionLabel: "소형견 동반",
    pawCount: 6,
    imageUrl: "/img/home-place.png",
  },
  {
    id: "home-coffee-tree-3",
    title: "커피나무 숭실대점",
    category: "카페",
    distance: "1.3km",
    companionLabel: "소형견 동반",
    pawCount: 6,
    imageUrl: "/img/home-place.png",
  },
] as const

export const requiredTermKeys = ["service", "privacy", "location"] as const
export type RequiredTermKey = (typeof requiredTermKeys)[number]

export type TermsSection = {
  heading: string
  paragraphs?: string[]
  items?: string[]
}

export type TermsContent = {
  title: string
  effectiveDate: string
  sections: TermsSection[]
}

export const termsContent: Record<RequiredTermKey, TermsContent> = {
  service: {
    title: "서비스 이용약관",
    effectiveDate: "2026. 08. 14 개정 및 시행",
    sections: [
      {
        heading: "제1조 (목적)",
        paragraphs: [
          '이 약관은 SSUZERO가 제공하는 개동여지도 및 관련 제반 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.',
        ],
      },
      {
        heading: "제2조 (정의)",
        paragraphs: ["이 약관에서 사용하는 용어의 정의는 다음과 같습니다."],
        items: [
          '"서비스"란 반려동물 동반 여행 코스 생성, 장소 정보 제공, 여행 기록 및 커뮤니티 기능을 위해 제공하는 웹 서비스와 관련 서비스를 말합니다.',
          '"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을 말합니다.',
          '"회원"이란 카카오 계정으로 가입하여 서비스를 지속적으로 이용할 수 있는 자를 말합니다.',
          '"콘텐츠"란 이용자가 서비스 내에 작성하거나 등록하는 코스, 여행 기록, 일기, 사진, 후기 등 일체의 정보를 말합니다.',
        ],
      },
      {
        heading: "제3조 (서비스의 제공)",
        items: [
          "회사는 반려동물 동반 장소 탐색, 맞춤 코스 생성, 코스 저장, 여행 기록 및 커뮤니티 기능을 제공합니다.",
          "서비스의 내용은 운영상·기술상 필요에 따라 변경될 수 있으며, 중요한 변경은 서비스 내 공지로 안내합니다.",
          "장소·경로 정보는 참고용입니다. 방문 전 반려동물 동반 가능 여부, 운영시간 및 현장 규칙을 이용자가 직접 확인해야 합니다.",
        ],
      },
      {
        heading: "제4조 (회원의 의무)",
        items: [
          "이용자는 관계 법령, 이 약관 및 서비스 내 안내사항을 준수해야 합니다.",
          "타인의 권리를 침해하거나 허위·불법·위험한 정보를 등록해서는 안 됩니다.",
          "이용자가 등록한 콘텐츠에 관한 책임은 해당 이용자에게 있으며, 회사는 서비스 운영을 위해 필요한 범위에서 이를 노출·저장할 수 있습니다.",
        ],
      },
      {
        heading: "제5조 (약관의 게시와 개정)",
        items: [
          "회사는 이 약관을 이용자가 쉽게 확인할 수 있도록 서비스 화면에 게시합니다.",
          "회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있습니다.",
          "약관을 개정하는 경우 적용일과 개정 사유를 서비스 내에 미리 안내합니다.",
        ],
      },
    ],
  },
  privacy: {
    title: "개인정보 처리방침",
    effectiveDate: "2026. 08. 14 제정 및 시행",
    sections: [
      {
        heading: "1. 개인정보의 처리 목적",
        paragraphs: [
          "개동여지도는 회원 식별, 서비스 제공, 반려견 맞춤 코스 추천, 여행 기록 관리 및 서비스 개선을 위해 필요한 최소한의 개인정보를 처리합니다.",
        ],
      },
      {
        heading: "2. 처리하는 개인정보 항목",
        items: [
          "카카오 로그인: 카카오 계정 식별자, 닉네임 및 프로필 정보 중 이용자가 동의하여 제공한 정보",
          "반려견 프로필: 이름, 크기, 출생연도 등 이용자가 직접 입력한 정보",
          "서비스 이용 기록: 생성·저장한 코스, 여행 일기 및 서비스 이용 과정에서 생성되는 기록",
          "위치 정보: 위치기반 서비스 이용에 동의하고 기기 권한을 허용한 경우의 현재 위치 정보",
        ],
      },
      {
        heading: "3. 개인정보의 보유 및 이용기간",
        paragraphs: [
          "개인정보는 회원 탈퇴 또는 처리 목적 달성 시까지 보유·이용합니다. 다만 관련 법령에 따라 보관이 필요한 경우에는 해당 기간 동안 보관할 수 있습니다.",
        ],
      },
      {
        heading: "4. 개인정보의 제3자 제공 및 처리 위탁",
        paragraphs: [
          "회사는 이용자의 동의 또는 법령상 근거가 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다. 서비스 운영에 필요한 외부 서비스 이용 시에는 관련 법령과 이 방침에 따라 관리합니다.",
        ],
      },
      {
        heading: "5. 이용자의 권리",
        paragraphs: [
          "이용자는 언제든지 자신의 개인정보를 조회·수정하거나 회원 탈퇴를 요청할 수 있습니다. 위치 정보 이용 동의는 기기 또는 서비스 설정에서 철회할 수 있습니다.",
        ],
      },
    ],
  },
  location: {
    title: "위치 기반 서비스 이용약관",
    effectiveDate: "2026. 08. 14 제정 및 시행",
    sections: [
      {
        heading: "제1조 (목적)",
        paragraphs: [
          "이 약관은 개동여지도가 이용자의 위치 정보를 활용하여 제공하는 위치기반 서비스의 이용 조건과 절차, 이용자와 회사의 권리 및 의무를 정하는 것을 목적으로 합니다.",
        ],
      },
      {
        heading: "제2조 (위치 정보의 이용 목적)",
        items: [
          "현재 위치 주변의 반려동물 동반 가능 장소를 탐색하고 표시합니다.",
          "이용자의 출발지 또는 선택한 지역을 기준으로 여행 코스와 이동 경로를 추천합니다.",
          "서비스 품질 개선과 오류 분석을 위해 필요한 범위에서 위치 관련 요청 기록을 활용할 수 있습니다.",
        ],
      },
      {
        heading: "제3조 (이용 및 철회)",
        paragraphs: [
          "이용자는 위치 정보 이용에 동의한 뒤 기기의 위치 권한을 허용하여 서비스를 이용할 수 있습니다. 동의 또는 권한을 철회해도 기본 서비스는 이용할 수 있으나, 주변 장소·맞춤 코스 등 일부 기능은 제한될 수 있습니다.",
        ],
      },
      {
        heading: "제4조 (이용자의 권리와 의무)",
        items: [
          "이용자는 언제든지 위치 정보 이용 동의를 철회할 수 있습니다.",
          "이용자는 기기 설정에서 위치 권한을 변경할 수 있습니다.",
          "위치 정보에 기반한 장소와 경로는 참고용이므로, 실제 이동 전 현장 안전과 이용 가능 여부를 확인해야 합니다.",
        ],
      },
      {
        heading: "제5조 (약관의 변경)",
        paragraphs: [
          "회사는 관련 법령을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경 사항은 서비스 화면을 통해 안내합니다.",
        ],
      },
    ],
  },
}

export type OnboardingProfile = {
  dogName: string
  dogSize: "small" | "medium" | "large" | null
  birthYear: string
  /**
   * A local preview used while the new member is completing onboarding.
   * The registration endpoint currently accepts an image URL only, so this is
   * deliberately kept out of the API mapper until an upload URL is available.
   */
  profileImagePreview?: string | null
}

export const initialOnboardingProfile: OnboardingProfile = {
  dogName: "",
  dogSize: null,
  birthYear: String(new Date().getFullYear()),
  profileImagePreview: null,
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
