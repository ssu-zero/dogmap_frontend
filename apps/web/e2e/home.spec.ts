import { expect, test } from "@playwright/test"

test("navigates the authentication and terms flow to home", async ({
  page,
}) => {
  await page.goto("/login")

  await page.getByRole("button", { name: "카카오로 시작하기" }).click()
  await page.getByRole("button", { name: "다음" }).click()
  await page.getByRole("button", { name: "다음" }).click()
  await page.getByRole("button", { name: "전체 동의" }).click()
  await page.getByRole("button", { name: "동의하고 시작하기" }).click()

  await expect(
    page.getByRole("heading", { name: "오늘은 어디로 갈까요?" })
  ).toBeVisible()
})

test("creates a course from the empty course state", async ({ page }) => {
  await page.goto("/courses")
  await page.getByRole("button", { name: "새 코스 만들기" }).click()
  await page
    .getByRole("textbox", { name: "" })
    .fill("제로와 함께하는 오후 산책")
  await page.getByRole("button", { name: "코스 생성하기" }).click()

  await expect(
    page.getByRole("heading", { name: "제로와 함께하는 오후 산책" })
  ).toBeVisible({ timeout: 5_000 })
})

test("saves a community course into my courses", async ({ page }) => {
  await page.goto("/community/seoul-forest")
  await page.getByRole("button", { name: "내 코스에 저장" }).click()
  await expect(
    page.getByRole("button", { name: "내 코스에 저장됨" })
  ).toBeVisible()

  await page.goto("/courses")
  await expect(
    page.getByRole("heading", { name: "서울숲 반려견 산책 코스" })
  ).toBeVisible()
})

test("renders the home screen", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "오늘은 어디로 갈까요?" })
  ).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "주요 메뉴" })
  ).toBeVisible()
})

test("uses the correct app-frame width for the input device", async ({
  page,
}) => {
  await page.goto("/")

  const isTouchDevice = await page.evaluate(
    () => window.matchMedia("(pointer: coarse)").matches
  )
  const viewport = page.viewportSize()

  await expect(page.locator("main")).toHaveCSS(
    "width",
    isTouchDevice ? `${viewport?.width}px` : "375px"
  )
})
