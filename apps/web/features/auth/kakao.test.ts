import { afterEach, describe, expect, it, vi } from "vitest"

import { getKakaoAuthorizeUrl } from "./kakao"

describe("Kakao authorization", () => {
  const originalClientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
  const originalRedirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI

  afterEach(() => {
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY = originalClientId
    process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI = originalRedirectUri
    vi.unstubAllGlobals()
  })

  it("builds the authorization URL from public configuration", () => {
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY = "rest-key"
    process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI =
      "http://localhost:3000/auth/kakao/callback"

    const url = new URL(getKakaoAuthorizeUrl()!)
    expect(url.origin + url.pathname).toBe("https://kauth.kakao.com/oauth/authorize")
    expect(url.searchParams.get("client_id")).toBe("rest-key")
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/auth/kakao/callback"
    )
    expect(url.searchParams.get("response_type")).toBe("code")
  })

  it("uses the visitor's current domain for a browser login", () => {
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY = "rest-key"
    process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI =
      "https://dogmap-frontend-web-bice.vercel.app/auth/kakao/callback"
    vi.stubGlobal("window", {
      location: { origin: "https://www.dogmap.store" },
    })

    const url = new URL(getKakaoAuthorizeUrl()!)
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://www.dogmap.store/auth/kakao/callback"
    )
  })
})
