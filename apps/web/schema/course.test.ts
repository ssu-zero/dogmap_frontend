import { describe, expect, it } from "vitest"

import { courseCreateRequestSchema, nearbyCoursesParamsSchema } from "./course"

describe("course schemas", () => {
  it("accepts a valid course creation request", () => {
    const result = courseCreateRequestSchema.safeParse({
      start_lat: 37.5665,
      start_lng: 126.978,
      target_duration_minutes: 60,
      category_targets: [{ category: "WALK", count: 2 }],
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
})
