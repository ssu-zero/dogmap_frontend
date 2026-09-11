import { afterEach, describe, expect, it } from "vitest"

import { getKakaoAuthorizeUrl } from "./kakao"

describe("Kakao authorization", () => {
  const originalClientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
  const originalRedirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI

  afterEach(() => {
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY = originalClientId
    process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI = originalRedirectUri
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
})
