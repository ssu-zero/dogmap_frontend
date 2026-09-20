import { expect, test } from "@playwright/test"

test("selects a start time first and requires an end time at least one hour later", async ({
  page,
}) => {
  await page.goto("/courses/new")

  const startTime = page.getByRole("button", { name: /^시작 시간/ })
  const endTime = page.getByRole("button", { name: /^종료 시간/ })
  const timeInput = page.locator('input[type="time"]')
  const confirm = page.getByRole("button", { name: "확인" })

  await expect(endTime).toBeDisabled()
  await startTime.click()
  await timeInput.fill("23:00")
  await expect(confirm).toBeDisabled()
  await expect(
    page.getByText("시작 시간은 오후 10:59까지 선택해 주세요.")
  ).toBeVisible()

  await timeInput.fill("10:00")
  await confirm.click()
  await expect(endTime).toBeEnabled()

  await endTime.click()
  await expect(timeInput).toHaveValue("11:00")
  await timeInput.fill("10:59")
  await expect(confirm).toBeDisabled()
  await expect(
    page.getByText("종료 시간은 시작 시간보다 최소 1시간 뒤여야 해요.")
  ).toBeVisible()

  await timeInput.fill("11:00")
  await confirm.click()
  await expect(endTime).toContainText("11 : 00")

  await startTime.click()
  await timeInput.fill("11:30")
  await confirm.click()
  await expect(endTime).toContainText("시간 선택")
})
