import { expect, test, type Page } from "@playwright/test"

async function useLiveApiMode(page: Page, token?: string) {
  await page.addInitScript(
    ({ accessToken }) => {
      window.localStorage.setItem("dogmap.runtime-mode", "live")
      if (accessToken) {
        window.localStorage.setItem("dogmap.access-token", accessToken)
      }
    },
    { accessToken: token }
  )
}

const dog = {
  dog_id: 7,
  name: "몽이",
  size: "MEDIUM",
  age: 3,
  image_url: null,
}

test.beforeEach(async ({ page }) => {
  await page.route("**/backend-api/**", async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname

    if (request.method() === "GET" && pathname.endsWith("/dogs/me")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(dog),
      })
      return
    }

    if (
      request.method() === "GET" &&
      (pathname.endsWith("/api/courses") ||
        pathname.endsWith("/api/dogs/me/courses") ||
        pathname.endsWith("/api/saves") ||
        pathname.endsWith("/api/logs"))
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      })
      return
    }

    if (request.method() === "GET" && pathname.endsWith("/api/places")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      })
      return
    }

    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Unexpected API request in test" }),
    })
  })
})

test("exchanges a Kakao code with the backend and stores the access token", async ({
  page,
}) => {
  await useLiveApiMode(page)
  let loginBody: unknown

  await page.route("**/backend-api/api/auth/kakao/login", async (route) => {
    loginBody = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "LOGIN",
        access_token: "access-from-server",
        signup_token: null,
        dog_id: 7,
        kakao_nickname: "몽이 보호자",
        kakao_profile_image_url: null,
      }),
    })
  })
  await page.route("**/backend-api/api/dogs/me", async (route) => {
    expect(route.request().headers().authorization).toBe(
      "Bearer access-from-server"
    )
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(dog),
    })
  })
  await page.route("**/backend-api/api/courses*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    })
  })

  await page.goto("/auth/kakao/callback?code=kakao-code")
  await expect(
    page.getByRole("heading", { name: /오늘 .*랑.*어디 놀러 갈까요/ })
  ).toBeVisible()
  expect(loginBody).toMatchObject({
    code: "kakao-code",
    redirect_uri: "http://127.0.0.1:3001/auth/kakao/callback",
  })
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("dogmap.access-token"))
    )
    .toBe("access-from-server")
})

test("shows the backend login message when Kakao login is rejected", async ({
  page,
}) => {
  await useLiveApiMode(page)
  await page.route("**/backend-api/api/auth/kakao/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ detail: "카카오 인증이 만료되었어요." }),
    })
  })

  await page.goto("/auth/kakao/callback?code=expired-kakao-code")

  await expect(
    page.getByRole("heading", { name: "로그인을 완료하지 못했어요" })
  ).toBeVisible()
  await expect(page.getByText("카카오 인증이 만료되었어요.")).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() =>
        sessionStorage.getItem("dogmap.kakao-login-code:expired-kakao-code")
      )
    )
    .toBeNull()
  await page.getByRole("button", { name: "다시 로그인" }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test("registers the onboarding dog with the signup token", async ({ page }) => {
  await useLiveApiMode(page)
  let registrationBody: Record<string, unknown> | undefined

  await page.route("**/backend-api/api/auth/kakao/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "SIGNUP_REQUIRED",
        access_token: null,
        signup_token: "signup-from-server",
        dog_id: null,
        kakao_nickname: "새 보호자",
        kakao_profile_image_url: null,
      }),
    })
  })
  await page.route("**/backend-api/api/dogs", async (route) => {
    expect(route.request().headers().authorization).toBe(
      "Bearer signup-from-server"
    )
    registrationBody = route.request().postDataJSON()
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ access_token: "new-access-token", dog }),
    })
  })
  await page.route("**/backend-api/api/courses*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    })
  })

  await page.goto("/auth/kakao/callback?code=new-user-code")
  await expect(page).toHaveURL(/\/terms$/)
  await page.getByRole("button", { name: "네, 모두 동의합니다." }).click()
  await page.getByRole("button", { name: "가입 완료" }).click()
  await page.getByRole("textbox", { name: "반려견 이름" }).fill("몽이")
  await page.getByRole("button", { name: "다음" }).click()
  await page.getByRole("textbox", { name: "출생연도" }).fill("2023")
  await page.getByRole("button", { name: /중형/ }).click()
  await page.getByRole("button", { name: "개동여지도 시작하기" }).click()

  await expect(
    page.getByRole("heading", { name: /오늘 .*랑.*어디 놀러 갈까요/ })
  ).toBeVisible()
  expect(registrationBody).toMatchObject({
    name: "몽이",
    size: "MEDIUM",
    image_url: null,
  })
  expect(registrationBody?.age).toBeGreaterThanOrEqual(3)
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("dogmap.access-token"))
    )
    .toBe("new-access-token")
})

test("creates a course through the authenticated backend endpoint", async ({
  page,
}) => {
  await useLiveApiMode(page, "course-access-token")
  let createBody: Record<string, unknown> | undefined

  await page.route("**/backend-api/api/dogs/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(dog),
    })
  })
  await page.route("**/backend-api/api/courses", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      })
      return
    }
    expect(route.request().headers().authorization).toBe(
      "Bearer course-access-token"
    )
    createBody = route.request().postDataJSON()
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        course_id: 91,
        title: "서버가 만든 코스",
        start_lat: 35.9402,
        start_lng: 126.9463,
        walk_date: "2026-09-14T10:00:00+09:00",
        total_distance_meters: 1800,
        total_duration_minutes: 90,
        path: [
          [35.9402, 126.9463],
          [35.941, 126.947],
        ],
        places: [
          {
            place_id: 1,
            name: "익산 반려견 공원",
            category: "PARK",
            image_url: null,
            lat: 35.941,
            lng: 126.947,
            sequence: 1,
            stay_minutes: 30,
            travel_minutes: 15,
            travel_distance_meters: 900,
            visit_time: null,
          },
        ],
        is_owner: true,
        is_shared: false,
        like_count: 0,
        is_liked: false,
        save_count: 0,
        is_saved: false,
      }),
    })
  })
  await page.route("**/backend-api/api/courses/91/places", async (route) => {
    expect(route.request().method()).toBe("PUT")
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        course_id: 91,
        title: "서버가 만든 코스",
        start_lat: 35.9402,
        start_lng: 126.9463,
        walk_date: "2026-09-14T10:00:00+09:00",
        total_distance_meters: 1800,
        total_duration_minutes: 90,
        path: [
          [35.9402, 126.9463],
          [35.941, 126.947],
        ],
        places: [
          {
            place_id: 1,
            name: "익산 반려견 공원",
            category: "PARK",
            image_url: null,
            lat: 35.941,
            lng: 126.947,
            sequence: 1,
            stay_minutes: 30,
            travel_minutes: 15,
            travel_distance_meters: 900,
            visit_time: null,
          },
        ],
        is_owner: true,
        is_shared: false,
        like_count: 0,
        is_liked: false,
        save_count: 0,
        is_saved: false,
      }),
    })
  })

  await page.goto("/courses/new")
  await page.getByRole("textbox", { name: "코스 이름" }).fill("서버 요청 코스")
  await page.getByLabel("날짜").fill("2026-09-14")
  await page.getByLabel("시작 시간").fill("10:00")
  await page.getByLabel("종료 시간").fill("12:00")
  await page.getByRole("textbox", { name: "출발 위치" }).fill("현재 위치")
  await page.getByRole("button", { name: /90분 추천/ }).click()
  await page.getByRole("button", { name: /산책 가볍게/ }).click()
  await page.getByRole("button", { name: /카페 여유롭게/ }).click()
  await page.getByRole("button", { name: "코스 생성하기" }).click()

  await expect.poll(() => createBody).toBeTruthy()
  await expect(
    page.getByRole("heading", { name: "서버가 만든 코스" })
  ).toBeVisible()
  expect(createBody).toEqual({
    start_lat: 35.9402,
    start_lng: 126.9463,
    target_duration_minutes: 90,
    category_targets: [
      { category: "WALK", count: 1 },
      { category: "CAFE", count: 1 },
    ],
    title: "서버 요청 코스",
    walk_date: "2026-09-14T10:00:00+09:00",
  })
})

test("loads nearby companion facilities from the backend", async ({
  page,
}) => {
  await useLiveApiMode(page, "places-access-token")
  let requestedUrl = ""

  await page.route("**/backend-api/api/places*", async (route) => {
    requestedUrl = route.request().url()
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          content_id: "place-51",
          title: "익산역 반려견 카페",
          category: "카페",
          address: "전북 익산시",
          lat: 35.9402,
          lng: 126.9463,
          dist: 120,
          image_url: null,
          overview: null,
          open_time: null,
          rest_day: null,
          pet_accompany_type: "동반 가능",
          pet_need_materials: null,
          pet_caution: null,
          pet_facilities: null,
          place_id: 51,
          like_count: 0,
          is_liked: false,
        },
      ]),
    })
  })

  await page.goto("/")
  await expect(
    page.getByRole("heading", { name: "익산역 반려견 카페" })
  ).toBeVisible()
  expect(requestedUrl).toContain("lat=35.9402")
  expect(requestedUrl).toContain("lng=126.9463")

  await expect(page.getByText("카페 · 0.1km")).toBeVisible()
})

test("loads and patches the server-backed dog profile", async ({ page }) => {
  await useLiveApiMode(page, "profile-access-token")
  let patchBody: unknown
  let currentDog = dog

  await page.route("**/backend-api/api/dogs/me", async (route) => {
    expect(route.request().headers().authorization).toBe(
      "Bearer profile-access-token"
    )
    if (route.request().method() === "PATCH") {
      patchBody = route.request().postDataJSON()
      currentDog = { ...dog, name: "보리", size: "LARGE", age: 4 }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(currentDog),
      })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(currentDog),
    })
  })

  await page.goto("/mypage")
  await expect(page.getByRole("heading", { name: "몽이" })).toBeVisible()
  await page.getByRole("button", { name: "수정" }).click()
  await page.getByRole("textbox", { name: "반려견 이름 수정" }).fill("보리")
  await page.getByRole("textbox", { name: "반려견 나이" }).fill("4")
  await page.getByRole("button", { name: "대형" }).click()
  await page.getByRole("button", { name: "저장하기" }).click()

  await expect(page.getByRole("heading", { name: "보리" })).toBeVisible()
  await expect(page.getByText("4살 · 대형견")).toBeVisible()
  expect(patchBody).toEqual({ name: "보리", age: 4, size: "LARGE" })
})

test("does not silently create a demo course for a signed-out live user", async ({
  page,
}) => {
  await useLiveApiMode(page)
  await page.goto("/courses/generating")

  await expect(
    page.getByText("코스를 만들려면 카카오 로그인이 필요합니다.")
  ).toBeVisible()
  await page.getByRole("button", { name: "로그인하기" }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test("uses the login entry screen for a signed-out live visitor", async ({
  page,
}) => {
  await useLiveApiMode(page)
  await page.goto("/")

  await expect(
    page.getByRole("button", { name: "카카오 로그인" })
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "동반 가능한 모든 곳" })).toHaveCount(
    0
  )
})

test("does not present demo community data as live server data", async ({
  page,
}) => {
  await useLiveApiMode(page)
  await page.goto("/community")

  await expect(page.getByRole("heading", { name: "커뮤니티" })).toBeVisible()
  await expect(page.getByText("서울숲 반려견 산책 코스")).toHaveCount(0)
})
