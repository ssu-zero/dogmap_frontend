import { describe, expect, it } from "vitest"

import {
  initialCourseDraft,
  isCourseDraftComplete,
  isValidCourseTimeRange,
  minimumCourseEndTime,
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

  it("requires the end time to be at least one hour after the start time on the same day", () => {
    expect(minimumCourseEndTime("10:00")).toBe("11:00")
    expect(minimumCourseEndTime("22:59")).toBe("23:59")
    expect(minimumCourseEndTime("23:00")).toBeNull()
    expect(minimumCourseEndTime("invalid")).toBeNull()

    expect(isValidCourseTimeRange("10:00", "10:59")).toBe(false)
    expect(isValidCourseTimeRange("10:00", "11:00")).toBe(true)
    expect(isValidCourseTimeRange("10:00", "09:00")).toBe(false)
    expect(isValidCourseTimeRange("22:59", "23:59")).toBe(true)
    expect(isValidCourseTimeRange("23:00", "23:59")).toBe(false)
    expect(isValidCourseTimeRange("23:30", "00:30")).toBe(false)

    const otherwiseCompleteDraft = {
      ...initialCourseDraft,
      title: "제로와 산책",
      date: "2026-09-25",
      startTime: "10:00",
      endTime: "10:59",
      startLocation: "익산역",
    }
    expect(isCourseDraftComplete(otherwiseCompleteDraft)).toBe(false)
    expect(
      isCourseDraftComplete({ ...otherwiseCompleteDraft, endTime: "11:00" })
    ).toBe(true)
  })
})
