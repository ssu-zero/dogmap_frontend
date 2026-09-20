import { expect, test } from "@playwright/test"

test("shows each Figma generation state for 2.5 seconds before revealing the course", async ({
  page,
}) => {
  test.setTimeout(25_000)

  await page.goto("/courses/generating")

  await expect(
    page.getByRole("heading", { name: "제로 맞춤 코스를 만들고 있어요" })
  ).toBeVisible()
  await expect(page.getByText("탐색중 ···")).toBeVisible()
  await expect(page.getByText("계산중 ···")).toBeVisible({ timeout: 4_000 })
  await expect(page.getByText("조합중 ···")).toBeVisible({ timeout: 4_000 })
  await expect(page.getByText("그리는 중 ···")).toBeVisible({ timeout: 4_000 })
  await expect(page).toHaveURL(/\/courses\/generating$/)

  await expect(page).toHaveURL(/\/courses\/generated-\d+$/, {
    timeout: 6_000,
  })
  await expect(page.getByRole("region", { name: "코스 지도" })).toBeVisible()
})

test("sends a no-candidate region back to the course form to change location", async ({
  page,
}) => {
  test.setTimeout(25_000)

  await page.addInitScript(() => {
    window.localStorage.setItem("dogmap.runtime-mode", "live")
    window.localStorage.setItem("dogmap.access-token", "test-access-token")
  })
  await page.route("**/api.dogmap.store/**", async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname

    if (request.method() === "POST" && pathname === "/api/courses") {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ detail: "최종 확정할 장소 후보가 없습니다." }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: pathname.endsWith("/dogs/me")
        ? JSON.stringify({
            dog_id: 7,
            name: "제로",
            size: "MEDIUM",
            age: 3,
            image_url: null,
          })
        : "[]",
    })
  })

  await page.goto("/courses/new")
  await expect(page.getByRole("heading", { name: "코스 만들기" })).toBeVisible()
  await page.getByRole("button", { name: /날짜/ }).click()
  await page.locator('input[type="date"]').fill("2026-09-25")
  await page.getByRole("button", { name: "확인" }).click()
  await page.getByRole("button", { name: /^시작 시간/ }).click()
  await page.locator('input[type="time"]').fill("10:00")
  await page.getByRole("button", { name: "확인" }).click()
  await page.getByRole("button", { name: /^종료 시간/ }).click()
  await page.locator('input[type="time"]').fill("12:00")
  await page.getByRole("button", { name: "확인" }).click()
  await page.getByRole("button", { name: "만들기", exact: true }).click()
  await expect(
    page.getByText("현재 위치에 적절한 코스가 없습니다.")
  ).toBeVisible({ timeout: 13_000 })
  await expect(page.getByRole("button", { name: "다시 시도" })).toHaveCount(0)
  await page.getByRole("button", { name: "장소 바꾸기" }).click()
  await expect(page).toHaveURL(/\/courses\/new$/)
  await expect(page.getByRole("button", { name: /날짜/ })).toContainText(
    "2026.09.25"
  )
  await expect(page.getByText("10 : 00")).toBeVisible()
  await expect(page.getByText("12 : 00")).toBeVisible()
  await expect(page.getByRole("button", { name: /출발 위치/ })).toBeVisible()
})
