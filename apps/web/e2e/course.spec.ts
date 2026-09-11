import { expect, test } from "@playwright/test"

test("creates a course from the empty state and adds it to my course list", async ({
  page,
}) => {
  await page.goto("/courses")

  await expect(
    page.getByRole("heading", { name: "아직 만든 코스가 없어요" })
  ).toBeVisible()
  await page.getByRole("button", { name: "첫 코스 만들기" }).click()

  const create = page.getByRole("button", { name: "코스 생성하기" })
  await expect(create).toBeDisabled()

  await page
    .getByRole("textbox", { name: "코스 이름" })
    .fill("제로의 성수 산책")
  await page.getByRole("button", { name: /90분 추천/ }).click()
  await page.getByRole("button", { name: /카페 여유롭게/ }).click()
  await expect(create).toBeEnabled()
  await create.click()

  await expect(
    page.getByRole("heading", { name: "제로에게 딱 맞는 코스를 만들고 있어요" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "제로의 성수 산책" })
  ).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText("약 90분 · 3곳")).toBeVisible()
  await page.getByRole("button", { name: "코스 지도 보기" }).click()
  await expect(page.getByRole("dialog", { name: "스팟 상세" })).toBeVisible()
  await page.getByRole("button", { name: "닫기" }).click()
  await expect(page.getByRole("dialog", { name: "스팟 상세" })).toHaveCount(0)

  await page.getByRole("button", { name: "내 코스 목록 보기" }).click()
  await expect(
    page.getByRole("heading", { name: "제로의 성수 산책" })
  ).toBeVisible()
})

test("shows the reduced-place edge-case result", async ({ page }) => {
  await page.goto("/courses/edge-case")

  await expect(
    page.getByRole("heading", { name: "장소가 적은 짧은 산책" })
  ).toBeVisible()
  await expect(page.getByText("엣지 케이스")).toBeVisible()
  await expect(page.getByText("약 30분 · 1곳")).toBeVisible()
})
