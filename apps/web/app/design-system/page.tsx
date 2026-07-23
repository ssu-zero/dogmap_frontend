import type { Metadata } from "next"

import { FoundationsPage } from "@/components/design-system/foundations-page"

export const metadata: Metadata = {
  title: "Design System | 개동여지도",
  description: "개동여지도 컬러, 타이포그래피, 간격 파운데이션",
}

export default function DesignSystemPage() {
  return <FoundationsPage />
}
