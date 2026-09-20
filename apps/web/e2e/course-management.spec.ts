import { expect, test, type Page } from "@playwright/test"

async function mockOwnedCourse(page: Page) {
  const calls: { method: string; path: string; body?: unknown }[] = []
  const course = {
    course_id: 7,
    title: "원래 코스",
    start_lat: 37.5,
    start_lng: 127.1,
    walk_date: "2026-09-20T10:00:00+09:00",
    total_distance_meters: 500,
    total_duration_minutes: 60,
    path: [
      [37.5, 127.1],
      [37.501, 127.101],
      [37.502, 127.102],
    ],
    places: [
      {
        place_id: 1,
        name: "첫 번째 스팟",
        category: "PARK",
        image_url: null,
        lat: 37.501,
        lng: 127.101,
        sequence: 1,
        stay_minutes: 20,
        travel_minutes: 5,
        travel_distance_meters: 200,
        visit_time: "2026-09-20T10:05:00+09:00",
      },
      {
        place_id: 2,
        name: "두 번째 스팟",
        category: "CAFE",
        image_url: null,
        lat: 37.502,
        lng: 127.102,
        sequence: 2,
        stay_minutes: 20,
        travel_minutes: 5,
        travel_distance_meters: 300,
        visit_time: "2026-09-20T10:30:00+09:00",
      },
    ],
    is_owner: true,
    is_shared: false,
    like_count: 0,
    is_liked: false,
    save_count: 0,
    is_saved: false,
    generation_duration_ms: null,
  }

  await page.addInitScript(() => {
    window.localStorage.setItem("dogmap.runtime-mode", "live")
    window.localStorage.setItem("dogmap.access-token", "test-access-token")
  })
  await page.route("**/api.dogmap.store/**", async (route) => {
    const request = route.request()
    const method = request.method()
    const path = new URL(request.url()).pathname
    const body = request.postDataJSON() as unknown
    calls.push({ method, path, body })

    if (path === "/api/dogs/me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          dog_id: 7,
          name: "제로",
          size: "MEDIUM",
          age: 3,
          image_url: null,
        }),
      })
      return
    }
    if (path === "/api/courses/7" && method === "PATCH") {
      Object.assign(course, body)
    }
    if (path === "/api/courses/7/places" && method === "PUT") {
      const replacement = body as {
        places: typeof course.places
        path: number[][]
      }
      course.places = replacement.places
      course.path = replacement.path
    }
    if (path === "/api/courses/7/share" && method === "POST") {
      course.is_shared = true
    }
    if (path === "/api/courses/7" && method === "DELETE") {
      await route.fulfill({ status: 204, body: "" })
      return
    }
    if (path === "/api/dogs/me/courses" || path === "/api/saves") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: path.startsWith("/api/courses/7") ? JSON.stringify(course) : "[]",
    })
  })

  return calls
}

test("opens the course menu, edits the title, and saves a removed spot through the API", async ({
  page,
}) => {
  const calls = await mockOwnedCourse(page)
  await page.goto("/courses/7")
  await expect(page.getByRole("region", { name: "코스 스팟" })).toContainText(
    "첫 번째 스팟"
  )

  await page.getByRole("button", { name: "코스 메뉴" }).click()
  await expect(page.getByRole("menu", { name: "코스 관리" })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "코스 제목 수정" })
  ).toHaveCount(0)
  const editAction = page.getByRole("menuitem", { name: "수정하기" })
  await expect(editAction).toHaveCSS("background-color", "rgb(48, 48, 48)")
  await expect(editAction).toHaveCSS("height", "40px")
  await editAction.click()
  await page.getByRole("button", { name: "코스 제목 수정" }).click()
  await page.getByRole("textbox", { name: "코스 제목" }).fill("바뀐 코스")
  await page.getByRole("button", { name: "스팟 제거" }).first().click()
  await expect(
    page.getByRole("dialog", { name: "스팟 삭제 확인" })
  ).toBeVisible()
  await page.getByRole("button", { name: "삭제하기" }).click()
  await expect(page.getByRole("status")).toHaveText("스팟이 삭제되었습니다")
  await page.getByRole("button", { name: "수정하기" }).click()

  await expect(page.getByRole("heading", { name: "바뀐 코스" })).toBeVisible()
  await expect(
    page.getByRole("region", { name: "코스 스팟" })
  ).not.toContainText("첫 번째 스팟")
  expect(
    calls.some(
      (call) => call.method === "PATCH" && call.path === "/api/courses/7"
    )
  ).toBe(true)
  expect(
    calls.find(
      (call) => call.method === "PUT" && call.path === "/api/courses/7/places"
    )?.body
  ).toMatchObject({ places: [{ place_id: 2, sequence: 1 }] })
})

test("shares and deletes a course only after choosing menu actions", async ({
  page,
}) => {
  const calls = await mockOwnedCourse(page)
  await page.goto("/courses/7")
  await expect(page.getByRole("region", { name: "코스 스팟" })).toBeVisible()

  await page.getByRole("button", { name: "코스 메뉴" }).click()
  await page.getByRole("menuitem", { name: "공유하기" }).click()
  await expect(page.getByRole("status")).toHaveText("코스가 공유되었습니다")
  expect(
    calls.some(
      (call) => call.method === "POST" && call.path === "/api/courses/7/share"
    )
  ).toBe(true)

  await page.getByRole("button", { name: "코스 메뉴" }).click()
  await page.getByRole("menuitem", { name: "삭제하기" }).click()
  await expect(
    page.getByRole("dialog", { name: "코스 삭제 확인" })
  ).toBeVisible()
  expect(calls.some((call) => call.method === "DELETE")).toBe(false)
  await page.getByRole("button", { name: "삭제하기" }).click()
  await expect(page).toHaveURL(/\/courses$/)
  expect(
    calls.some(
      (call) => call.method === "DELETE" && call.path === "/api/courses/7"
    )
  ).toBe(true)
})
