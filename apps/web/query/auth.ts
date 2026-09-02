import { mutationOptions } from "@tanstack/react-query"

import { loginWithKakao } from "@/api/auth"

/** Auth endpoints are mutations; this keeps their TanStack Query options colocated. */
export const kakaoLoginMutationOptions = () =>
  mutationOptions({
    mutationKey: ["auth", "kakao", "login"],
    mutationFn: loginWithKakao,
  })
