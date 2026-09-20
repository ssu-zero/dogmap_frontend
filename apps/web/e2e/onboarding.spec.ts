import { expect, test } from "@playwright/test"

async function agreeToRequiredTerms(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "네, 모두 동의합니다." }).click()
  await expect(page.getByRole("button", { name: "가입 완료" })).toBeEnabled()
  await page.getByRole("button", { name: "가입 완료" }).click()
}

test("launches through terms and completes the dog onboarding flow", async ({
  page,
}) => {
  await page.goto("/login")

  await page.getByRole("button", { name: "카카오 로그인" }).click()
  await agreeToRequiredTerms(page)

  await expect(page.getByRole("button", { name: "다음" })).toBeDisabled()
  await page.getByRole("textbox", { name: "반려견 이름" }).fill("몽이")
  await page.getByRole("button", { name: "다음" }).click()

  await expect(
    page.getByRole("button", { name: "개동여지도 시작하기" })
  ).toBeDisabled()
  await page.getByRole("textbox", { name: "출생연도" }).fill("2023")
  await page.getByRole("button", { name: /중형/ }).click()
  await page.getByRole("button", { name: "개동여지도 시작하기" }).click()

  await expect(
    page.getByRole("heading", { name: /오늘 .*랑.*어디 놀러 갈까요/ })
  ).toBeVisible()
  await expect(
    page.getByRole("dialog", { name: "위치 권한 필요" })
  ).toHaveCount(0)
  await expect(page.getByText("몽이와 함께")).toBeVisible()
})

test("does not allow a required-terms submission until every term is agreed", async ({
  page,
}) => {
  await page.goto("/terms")
  const complete = page.getByRole("button", { name: "가입 완료" })
  await expect(complete).toBeDisabled()

  await page
    .getByRole("button", { name: "서비스 이용약관 동의", exact: true })
    .click()
  await page.getByRole("button", { name: "개인정보 처리방침 동의" }).click()
  await expect(complete).toBeDisabled()
  await page
    .getByRole("button", { name: "위치 기반 서비스 이용약관 동의" })
    .click()
  await expect(complete).toBeEnabled()
})

test("keeps agreement state after opening and returning from a term detail", async ({
  page,
}) => {
  await page.goto("/terms")
  const service = page.getByRole("button", {
    name: "서비스 이용약관 동의",
    exact: true,
  })
  await service.click()
  await expect(service).toHaveAttribute("aria-pressed", "true")
  await page.getByRole("link", { name: "보기" }).first().click()
  await expect(
    page.getByRole("heading", { name: "서비스 이용약관" })
  ).toBeVisible()
  await page.getByRole("button", { name: "뒤로 가기" }).click()
  await expect(service).toHaveAttribute("aria-pressed", "true")
})

test("keeps the app frame at 375px on desktop and viewport width on mobile", async ({
  page,
}) => {
  await page.goto("/login")
  const isTouchDevice = await page.evaluate(
    () => window.matchMedia("(pointer: coarse)").matches
  )
  const viewport = page.viewportSize()

  await expect(page.locator("main")).toHaveCSS(
    "width",
    isTouchDevice ? `${viewport?.width}px` : "375px"
  )
})
