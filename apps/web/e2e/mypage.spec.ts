import { expect, test } from "@playwright/test"

test("edits and reflects profile information", async ({ page }) => {
  await page.goto("/mypage")
  await page.getByRole("button", { name: "프로필 수정" }).click()

  await page.getByRole("textbox", { name: "보호자 이름" }).fill("새 보호자")
  await page.getByRole("textbox", { name: "반려견 이름 수정" }).fill("보리")
  await page.getByRole("textbox", { name: "반려견 나이" }).fill("4살")
  await page.getByRole("button", { name: "저장하기" }).click()

  await expect(page.getByRole("heading", { name: "새 보호자" })).toBeVisible()
  await expect(page.getByText("보리 · 4살")).toBeVisible()
})

test("opens a reusable term detail and returns to my page", async ({
  page,
}) => {
  await page.goto("/mypage")
  await page.getByRole("button", { name: "약관 보기" }).click()

  await expect(
    page.getByRole("heading", { name: "서비스 이용약관" })
  ).toBeVisible()
  await page.getByRole("button", { name: "뒤로 가기" }).click()
  await expect(page.getByRole("heading", { name: "마이페이지" })).toBeVisible()
})

test("renders the error and not-found recovery actions", async ({ page }) => {
  await page.goto("/error-demo")
  await expect(
    page.getByRole("heading", { name: "문제가 발생했어요" })
  ).toBeVisible()
  await page.getByRole("button", { name: "홈으로" }).click()
  await expect(
    page.getByRole("heading", { name: "오늘은 어디로 갈까요?" })
  ).toBeVisible()

  await page.goto("/route-that-does-not-exist")
  await expect(
    page.getByRole("heading", { name: "페이지를 찾을 수 없어요" })
  ).toBeVisible()
  await page.getByRole("link", { name: "홈으로 돌아가기" }).click()
  await expect(
    page.getByRole("heading", { name: "오늘은 어디로 갈까요?" })
  ).toBeVisible()
})
