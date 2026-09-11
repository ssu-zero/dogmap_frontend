import { KakaoCallbackScreen } from "@/features/auth/kakao-callback-screen"

export default async function KakaoCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string | string[] }>
}) {
  const codeValue = (await searchParams).code
  const code = Array.isArray(codeValue) ? codeValue[0] : codeValue

  return <KakaoCallbackScreen code={code} />
}
