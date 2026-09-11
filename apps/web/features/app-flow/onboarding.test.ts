import { describe, expect, it } from "vitest"

import {
  initialOnboardingProfile,
  isDogInfoComplete,
  isDogNameValid,
} from "./mock-data"

describe("onboarding validation", () => {
  it("requires a non-blank dog name of 20 characters or fewer", () => {
    expect(isDogNameValid(" ")).toBe(false)
    expect(isDogNameValid("제로")).toBe(true)
    expect(isDogNameValid("가".repeat(21))).toBe(false)
  })

  it("requires both a size and a four-digit birth year", () => {
    expect(isDogInfoComplete(initialOnboardingProfile)).toBe(false)
    expect(
      isDogInfoComplete({
        dogName: "제로",
        dogSize: "small",
        birthYear: "2023",
      })
    ).toBe(true)
  })
})
