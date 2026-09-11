import { describe, expect, it } from "vitest"

import {
  initialCourseDraft,
  isCourseDraftComplete,
  toggleCourseTheme,
} from "./mock-data"

describe("course draft validation", () => {
  it("requires each Harness course input before generating a route", () => {
    expect(isCourseDraftComplete(initialCourseDraft)).toBe(false)
    expect(
      isCourseDraftComplete({
        title: "제로와 산책",
        date: "2026-09-14",
        startTime: "10:00",
        endTime: "13:00",
        startLocation: "익산역",
        duration: 90,
        themes: [],
      })
    ).toBe(false)
    expect(
      isCourseDraftComplete({
        title: "제로와 산책",
        date: "2026-09-14",
        startTime: "10:00",
        endTime: "13:00",
        startLocation: "익산역",
        duration: 90,
        themes: ["산책"],
      })
    ).toBe(true)

    expect(
      isCourseDraftComplete({
        title: "제로와 산책",
        date: "",
        startTime: "10:00",
        endTime: "13:00",
        startLocation: "익산역",
        duration: 90,
        themes: ["산책"],
      })
    ).toBe(false)
  })

  it("adds and removes selected course themes without duplicates", () => {
    const selected = toggleCourseTheme([], "카페")
    expect(selected).toEqual(["카페"])
    expect(toggleCourseTheme(selected, "카페")).toEqual([])
  })
})
