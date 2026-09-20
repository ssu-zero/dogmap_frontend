import { describe, expect, it } from "vitest"

import {
  courseCreateRequestSchema,
  courseSchema,
  nearbyCoursesParamsSchema,
} from "./course"

describe("course schemas", () => {
  it("accepts a valid course creation request", () => {
    const result = courseCreateRequestSchema.safeParse({
      start_lat: 37.5665,
      start_lng: 126.978,
      target_duration_minutes: 60,
      category_targets: [{ category: "WALK", count: 2 }],
      walk_date: "2026-09-20T10:00:00+09:00",
    })

    expect(result.success).toBe(true)
  })

  it("rejects coordinates and pagination values outside API bounds", () => {
    expect(
      nearbyCoursesParamsSchema.safeParse({ lat: 91, lng: 126.978 }).success
    ).toBe(false)
    expect(
      nearbyCoursesParamsSchema.safeParse({
        lat: 37.5665,
        lng: 126.978,
        limit: 0,
      }).success
    ).toBe(false)
  })

  it("treats timezone-naive backend course dates as Korean local time", () => {
    const result = courseSchema.parse({
      course_id: 2,
      title: "서울숲 산책",
      start_lat: 37.5445,
      start_lng: 127.0374,
      walk_date: "2026-09-25T10:00:00",
      total_distance_meters: 1000,
      total_duration_minutes: 45,
      path: [[37.5445, 127.0374]],
      places: [
        {
          place_id: 1,
          name: "성수연방",
          category: "PARK",
          image_url: null,
          lat: 37.544,
          lng: 127.038,
          sequence: 1,
          stay_minutes: 15,
          travel_minutes: 30,
          travel_distance_meters: 1000,
          visit_time: "2026-09-25T10:30:00",
        },
      ],
      is_owner: true,
      is_shared: false,
      like_count: 0,
      is_liked: false,
      save_count: 0,
      is_saved: false,
    })

    expect(result.walk_date).toBe("2026-09-25T10:00:00+09:00")
    expect(result.places[0]?.visit_time).toBe(
      "2026-09-25T10:30:00+09:00"
    )
  })
})
