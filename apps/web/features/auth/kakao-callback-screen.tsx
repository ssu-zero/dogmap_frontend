"use client"

import { useMutation } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import Image from "next/image"
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
        onError: () => {
          // A failed exchange never consumes the browser-side guard. Without
          // this cleanup, a remount of the callback route incorrectly reports
          // kakao-code-used instead of the actual API error.
          window.sessionStorage.removeItem(exchangeKey)
        },
      }
    )
  }, [code, login, router, updateUser])

  const errorMessage = !code
    ? "카카오 인증 코드가 전달되지 않았어요."
    : login.isError
      ? login.error.message
      : null

  if (errorMessage) {
    return (
      <main className="layout-mobile flex flex-col items-center justify-center gap-6 bg-white px-5 text-center">
        <h1 className="type-head-sb-20">로그인을 완료하지 못했어요</h1>
        <p className="type-body-r-14 text-gray-500">{errorMessage}</p>
        <Button onClick={() => router.replace("/login")}>다시 로그인</Button>
      </main>
    )
  }

  return (
    <main
      className="layout-mobile relative overflow-hidden bg-red-600"
      role="status"
      aria-label="카카오 로그인 확인 중"
    >
      <span className="sr-only">카카오 로그인을 확인하고 있어요.</span>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-123px] top-[62px] flex h-[377px] w-[620px] items-center justify-center"
      >
        <Image
          src="/img/splash-journey.svg"
          alt=""
          width={585}
          height={236}
          priority
          className="h-[236px] w-[585px] max-w-none -rotate-15"
        />
      </div>
      <Image
        src="/img/splash-paw-large.svg"
        alt=""
        width={31}
        height={28}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute left-[40px] top-[236px] h-[28px] w-[31px] rotate-[41deg]"
      />
      <Image
        src="/img/splash-paw-small.svg"
        alt=""
        width={23}
        height={21}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute left-[81px] top-[242px] h-[21px] w-[23px] rotate-[50deg]"
      />
      <Image
        src="/img/splash-paw-large.svg"
        alt=""
        width={31}
        height={28}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute left-[249px] top-[339px] h-[28px] w-[31px] rotate-[41deg]"
      />
      <Image
        src="/img/splash-paw-small.svg"
        alt=""
        width={23}
        height={21}
        priority
        aria-hidden="true"
        className="pointer-events-none absolute left-[291px] top-[343px] h-[21px] w-[23px] rotate-[50deg]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-[112px] flex flex-col items-center gap-[7px] text-center">
        <p className="type-body-r-16 tracking-[-0.01em] text-gray-50">
          반려동물 맞춤 산책코스
        </p>
        <Image
          src="/logo/login-main.svg"
          alt="개동여지도"
          width={92}
          height={23}
          priority
          className="h-[23px] w-[92px] object-contain"
        />
      </div>
    </main>
  )
}
