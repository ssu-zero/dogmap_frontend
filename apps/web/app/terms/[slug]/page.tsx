"use client"

import { FlowScreen } from "@/features/app-flow/flow-screen"
import { useParams } from "next/navigation"

import {
  requiredTermKeys,
  type RequiredTermKey,
} from "@/features/app-flow/mock-data"

export default function Page() {
  const { slug } = useParams<{ slug: string }>()
  const term = requiredTermKeys.includes(slug as RequiredTermKey)
    ? (slug as RequiredTermKey)
    : "service"

  return <FlowScreen screen="terms-detail" term={term} />
}
