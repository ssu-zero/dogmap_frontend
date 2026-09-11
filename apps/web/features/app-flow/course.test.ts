import { describe, expect, it } from "vitest"

import {
  initialCourseDraft,
  isCourseDraftComplete,
  toggleCourseTheme,
} from "./mock-data"

describe("course draft validation", () => {
  it("requires a title, a duration, and at least one course theme", () => {
    expect(isCourseDraftComplete(initialCourseDraft)).toBe(false)
    expect(
      isCourseDraftComplete({
        title: "제로와 산책",
        duration: 90,
        themes: [],
      })
    ).toBe(false)
    expect(
      isCourseDraftComplete({
        title: "제로와 산책",
        duration: 90,
        themes: ["산책"],
      })
    ).toBe(true)
  })

  it("adds and removes selected course themes without duplicates", () => {
    const selected = toggleCourseTheme([], "카페")
    expect(selected).toEqual(["카페"])
    expect(toggleCourseTheme(selected, "카페")).toEqual([])
  })
})
