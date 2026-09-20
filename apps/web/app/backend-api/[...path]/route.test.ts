import { afterEach, describe, expect, it, vi } from "vitest"

import { POST } from "./route"

describe("backend API proxy", () => {
  const originalApiOrigin = process.env.DOGMAP_API_ORIGIN

  afterEach(() => {
    process.env.DOGMAP_API_ORIGIN = originalApiOrigin
    vi.unstubAllGlobals()
  })

  it("follows an upstream canonical redirect before returning a POST response", async () => {
    process.env.DOGMAP_API_ORIGIN = "https://api.dogmap.store"
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "LOGIN" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    const response = await POST(
      new Request("https://www.dogmap.store/backend-api/api/auth/kakao/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: "kakao-code" }),
      }),
      { params: Promise.resolve({ path: ["api", "auth", "kakao", "login"] }) }
    )

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("api/auth/kakao/login", "https://api.dogmap.store/"),
      expect.objectContaining({ method: "POST", redirect: "follow" })
    )
    expect(await response.json()).toEqual({ status: "LOGIN" })
  })
})
