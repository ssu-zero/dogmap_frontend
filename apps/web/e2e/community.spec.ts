import { expect, test } from "@playwright/test"

test("saves another user's community course into my course list", async ({
  page,
}) => {
  await page.goto("/community")
  await page.getByRole("heading", { name: "서울숲 반려견 산책 코스" }).click()

  await expect(page.getByText("추천 코스")).toBeVisible()
  await page.getByRole("button", { name: "내 코스에 저장" }).click()
  await expect(
    page.getByRole("button", { name: "내 코스에 저장됨" })
  ).toBeVisible()

  await page.getByRole("button", { name: "저장한 코스 확인하기" }).click()
  await expect(
    page.getByRole("heading", { name: "서울숲 반려견 산책 코스" })
  ).toBeVisible()
})

test("shows own-course actions instead of a save action", async ({ page }) => {
  await page.goto("/community/zero-weekend")

  await expect(page.getByText("내 코스")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "내 코스에 저장" })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "목록" }).click()
  await expect(page.getByText("내 코스 관리")).toBeVisible()
  await page.getByRole("button", { name: "목록 닫기" }).click()
  await expect(page.getByText("내 코스 관리")).toHaveCount(0)
})

test("filters community courses by dog size and keeps the community tab active", async ({
  page,
}) => {
  await page.goto("/community")

  await expect(page.getByRole("button", { name: "커뮤니티" })).toHaveAttribute(
    "aria-current",
    "page"
  )
  await page.getByText("소형", { exact: true }).click()
  await expect(page.getByText("서울숲 반려견 산책 코스")).toBeVisible()
  await expect(page.getByText("제로의 주말 한강 코스")).toHaveCount(0)
})
