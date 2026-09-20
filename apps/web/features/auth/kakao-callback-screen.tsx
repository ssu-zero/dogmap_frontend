"use client"

import { useMutation } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Loading } from "@workspace/ui/components/loading"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

import { setAccessToken, setSignupToken } from "@/api/client"
import { kakaoLoginMutationOptions } from "@/query/auth"

import { useAppFlow } from "../app-flow/app-flow-provider"
import { getKakaoRedirectUri } from "./kakao"

export function KakaoCallbackScreen({ code }: { code?: string }) {
  const router = useRouter()
  const started = useRef(false)
  const { updateUser } = useAppFlow()
  const login = useMutation(kakaoLoginMutationOptions())

  useEffect(() => {
    if (started.current || !code) return
    const redirectUri = getKakaoRedirectUri()
    if (!redirectUri) return

    const exchangeKey = `dogmap.kakao-login-code:${code}`

    if (window.sessionStorage.getItem(exchangeKey)) {
      router.replace("/login?error=kakao-code-used")
      return
    }

    started.current = true
    window.sessionStorage.setItem(exchangeKey, "pending")

    login.mutate(
      { code, redirect_uri: redirectUri },
      {
        onSuccess: (result) => {
          window.sessionStorage.removeItem(exchangeKey)

          if (result.kakao_nickname) {
            updateUser({ name: result.kakao_nickname })
          }

          if (result.status === "LOGIN" && result.access_token) {
            setAccessToken(result.access_token)
            router.replace("/")
            return
          }

          if (result.status === "SIGNUP_REQUIRED" && result.signup_token) {
            setSignupToken(result.signup_token)
            router.replace("/terms")
            return
          }

          router.replace("/login?error=invalid-response")
        },
      }
    )
  }, [code, login, router, updateUser])

  const errorMessage = !code
    ? "카카오 인증 코드가 전달되지 않았어요."
    : login.isError
      ? login.error.message
      : null

  return (
    <main className="layout-mobile flex min-h-svh flex-col items-center justify-center gap-6 bg-white px-5 text-center">
      {errorMessage ? (
        <>
          <h1 className="type-head-sb-20">로그인을 완료하지 못했어요</h1>
          <p className="type-body-r-14 text-gray-500">{errorMessage}</p>
          <Button onClick={() => router.replace("/login")}>다시 로그인</Button>
        </>
      ) : (
        <>
          <Loading state="ing" />
          <h1 className="type-head-sb-20">카카오 로그인을 확인하고 있어요</h1>
        </>
      )}
    </main>
  )
}
