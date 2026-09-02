import { apiClient, parseResponse } from "@/api/client"
import {
  kakaoLoginRequestSchema,
  kakaoLoginResponseSchema,
  type KakaoLoginRequest,
} from "@/schema/auth"

export async function loginWithKakao(input: KakaoLoginRequest) {
  const body = kakaoLoginRequestSchema.parse(input)

  return parseResponse(
    apiClient.post("auth/kakao/login", { json: body }),
    kakaoLoginResponseSchema
  )
}
