import { z } from "zod"

export const kakaoLoginRequestSchema = z.object({
  code: z.string().min(1),
})

export const kakaoLoginResponseSchema = z.object({
  status: z.enum(["LOGIN", "SIGNUP_REQUIRED"]),
  access_token: z.string().nullable(),
  signup_token: z.string().nullable(),
  dog_id: z.number().int().nullable(),
  kakao_nickname: z.string().nullable(),
  kakao_profile_image_url: z.string().nullable(),
})

export type KakaoLoginRequest = z.input<typeof kakaoLoginRequestSchema>
export type KakaoLoginResponse = z.output<typeof kakaoLoginResponseSchema>
