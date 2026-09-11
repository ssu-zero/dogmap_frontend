export type Course = {
  id: string
  userId: string
  title: string
  duration: number
  places: string[]
  saved?: boolean
  edge?: boolean
}

export const currentUser = {
  id: "zero",
  name: "제로와 보호자",
  dogName: "제로",
  age: "3살",
}

export const communityCourses: Course[] = [
  {
    id: "seoul-forest",
    userId: "mango",
    title: "서울숲 반려견 산책 코스",
    duration: 90,
    places: ["서울숲", "댕댕이 카페", "성수 산책길"],
  },
  {
    id: "zero-weekend",
    userId: "zero",
    title: "제로의 주말 한강 코스",
    duration: 120,
    places: ["망원 한강공원", "반려견 놀이터", "망원시장"],
  },
]
