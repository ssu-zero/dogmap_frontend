import { describe, expect, it } from "vitest"

import {
  apiCourseToFlowCourse,
  courseAfterRemovingSpots,
  courseDraftToApiRequest,
  onboardingToDogCreate,
} from "./api-mappers"

describe("app-flow API mappers", () => {
  it("maps onboarding values to the backend dog contract", () => {
    expect(
      onboardingToDogCreate(
        { dogName: " 몽이 ", dogSize: "medium", birthYear: "2023" },
        2026
      )
    ).toEqual({ name: "몽이", size: "MEDIUM", age: 3, image_url: null })
  })

  it("maps course themes and coordinates to the backend create contract", () => {
    expect(
      courseDraftToApiRequest(
        {
          title: " 성수 산책 ",
          date: "2026-09-14",
          startTime: "10:00",
          endTime: "12:00",
          startLocation: "현재 위치",
          duration: 90,
          themes: ["산책", "카페"],
        },
        { lat: 37.5, lng: 127.1 }
      )
    ).toEqual({
      start_lat: 37.5,
      start_lng: 127.1,
      target_duration_minutes: 90,
      category_targets: [
        { category: "WALK", count: 1 },
        { category: "CAFE", count: 1 },
      ],
      title: "성수 산책",
      walk_date: "2026-09-14T10:00:00+09:00",
    })
  })

  it("keeps a created API course available to the flow UI", () => {
    expect(
      apiCourseToFlowCourse(
        {
          course_id: 42,
          title: "서버 코스",
          start_lat: 37.5,
          start_lng: 127.1,
          walk_date: "2026-09-14T10:00:00+09:00",
          total_distance_meters: 1200,
          total_duration_minutes: 61.5,
          path: [[37.5, 127.1]],
          places: [
            {
              place_id: 1,
              name: "서울숲",
              category: "PARK",
              image_url: null,
              lat: 37.5,
              lng: 127.1,
              sequence: 1,
              stay_minutes: 20,
              travel_minutes: 10,
              travel_distance_meters: 300,
              visit_time: null,
            },
          ],
          is_owner: true,
          is_shared: false,
          like_count: 0,
          is_liked: false,
          save_count: 0,
          is_saved: false,
          generation_duration_ms: null,
        },
        "42"
      )
    ).toMatchObject({
      id: "42",
      userId: "42",
      title: "서버 코스",
      duration: 62,
      places: ["서울숲"],
    })
  })

  it("removes a spot, resequences the rest, and drops its old route segment", () => {
    const course = {
      course_id: 42,
      title: "산책 코스",
      start_lat: 37.5,
      start_lng: 127.1,
      walk_date: "2026-09-14T10:00:00+09:00",
      total_distance_meters: 500,
      total_duration_minutes: 60,
      path: [
        [37.5, 127.1],
        [37.501, 127.101],
        [37.502, 127.102],
      ] as [number, number][],
      places: [
        {
          place_id: 1,
          name: "삭제할 스팟",
          category: "PARK" as const,
          image_url: null,
          lat: 37.501,
          lng: 127.101,
          sequence: 1,
          stay_minutes: 20,
          travel_minutes: 5,
          travel_distance_meters: 200,
          visit_time: null,
        },
        {
          place_id: 2,
          name: "남길 스팟",
          category: "CAFE" as const,
          image_url: null,
          lat: 37.502,
          lng: 127.102,
          sequence: 2,
          stay_minutes: 30,
          travel_minutes: 5,
          travel_distance_meters: 300,
          visit_time: null,
        },
      ],
      is_owner: true,
      is_shared: false,
      like_count: 0,
      is_liked: false,
      save_count: 0,
      is_saved: false,
    }

    const result = courseAfterRemovingSpots(course, [0])
    expect(result.places).toHaveLength(1)
    expect(result.places[0]).toMatchObject({ place_id: 2, sequence: 1 })
    expect(result.path).toEqual([
      [37.5, 127.1],
      [37.502, 127.102],
    ])
  })
})
