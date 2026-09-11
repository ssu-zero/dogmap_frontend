"use client"

import { useSyncExternalStore } from "react"

const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize"
const subscribeToRuntimeMode = () => () => undefined

export function getKakaoAuthorizeUrl() {
  const clientId = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return null
  }

  const url = new URL(KAKAO_AUTHORIZE_URL)
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("redirect_uri", redirectUri)
  url.searchParams.set("response_type", "code")
  return url.toString()
}

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_APP_MODE === "demo"
}

export function useDemoMode() {
  return useSyncExternalStore(
    subscribeToRuntimeMode,
    () =>
      window.localStorage.getItem("dogmap.runtime-mode") === "live"
        ? false
        : isDemoMode(),
    isDemoMode
  )
}
