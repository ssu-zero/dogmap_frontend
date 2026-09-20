import { describe, expect, it } from "vitest"

import {
  formatCourseCreatedAt,
  readCourseCreatedDates,
  saveCourseCreatedDate,
} from "./course-created-at-storage"

function createStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

describe("course creation date storage", () => {
  it("persists dates by course ID without replacing other courses", () => {
    const storage = createStorage()

    saveCourseCreatedDate(storage, "101", "2026.09.21")
    saveCourseCreatedDate(storage, "102", "2026.09.22")

    expect(readCourseCreatedDates(storage)).toEqual({
      "101": "2026.09.21",
      "102": "2026.09.22",
    })
  })

  it("ignores invalid stored data instead of inventing dates", () => {
    const storage = createStorage()
    storage.setItem("dogmap.course-created-at.v1", "invalid JSON")

    expect(readCourseCreatedDates(storage)).toEqual({})
  })

  it("still returns the new date when browser storage is unavailable", () => {
    expect(saveCourseCreatedDate(undefined, "101", "2026.09.21")).toEqual({
      "101": "2026.09.21",
    })
  })

  it("formats the creation day in Korean time", () => {
    expect(formatCourseCreatedAt(new Date("2026-09-20T16:00:00Z"))).toBe(
      "2026.09.21"
    )
  })
})
