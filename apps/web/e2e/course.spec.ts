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
  await page.getByLabel("날짜").fill("2026-09-14")
  await page.getByLabel("시작 시간").fill("10:00")
  await page.getByLabel("종료 시간").fill("13:00")
  await page.getByRole("textbox", { name: "출발 위치" }).fill("성수역")
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

test("keeps an archive route and diary interaction available after creating a course", async ({
  page,
}) => {
  await page.goto("/courses")
  await page.getByRole("button", { name: "첫 코스 만들기" }).click()
  await page.getByRole("textbox", { name: "코스 이름" }).fill("제로의 발자국")
  await page.getByLabel("날짜").fill("2026-09-14")
  await page.getByLabel("시작 시간").fill("10:00")
  await page.getByLabel("종료 시간").fill("13:00")
  await page.getByRole("textbox", { name: "출발 위치" }).fill("서울숲")
  await page.getByRole("button", { name: /60분 추천/ }).click()
  await page.getByRole("button", { name: /산책 가볍게/ }).click()
  await page.getByRole("button", { name: "코스 생성하기" }).click()
  await expect(page.getByRole("heading", { name: "제로의 발자국" })).toBeVisible({ timeout: 5_000 })
  await page.getByRole("button", { name: "내 코스 목록 보기" }).click()
  await page.getByRole("button", { name: "발자국" }).click()
  await expect(page.getByRole("heading", { name: "제로의 발자국" })).toBeVisible()
  await page.getByRole("button", { name: "제로의 발자국" }).click()
  await page.getByRole("textbox", { name: "여행 일기" }).fill("서울숲에서 즐겁게 산책했다.")
  await page.getByRole("button", { name: "일기 저장하기" }).click()
  await expect(page.getByText("일기를 저장했어요.")).toBeVisible()
  await page.getByRole("button", { name: "뒤로 가기" }).click()
  await page.getByRole("button", { name: "활동 리포트 보기" }).click()
  await expect(page.getByRole("heading", { name: "이번 달 산책 리포트" })).toBeVisible()
  await expect(page.getByText("1개", { exact: true })).toHaveCount(2)
})

test("shows the reduced-place edge-case result", async ({ page }) => {
  await page.goto("/courses/edge-case")

  await expect(
    page.getByRole("heading", { name: "장소가 적은 짧은 산책" })
  ).toBeVisible()
  await expect(page.getByText("엣지 케이스")).toBeVisible()
  await expect(page.getByText("약 30분 · 1곳")).toBeVisible()
})
