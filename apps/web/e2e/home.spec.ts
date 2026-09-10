import { expect, test } from "@playwright/test"

test("renders the home screen", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: "개동여지도" })).toBeVisible()
  await expect(page.getByRole("button", { name: "시작하기" })).toBeVisible()
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
