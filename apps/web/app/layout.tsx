import type { Metadata } from "next"

import "@workspace/ui/globals.css"
import { QueryProvider } from "@/components/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { AppFlowProvider } from "@/features/app-flow/app-flow-provider"

const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "개동여지도 | 반려견과 함께 떠나는 맞춤 여행 코스",
    template: "%s | 개동여지도",
  },
  description:
    "우리 강아지와 어디로 떠날지 고민될 때, 취향에 맞는 반려견 동반 여행 코스를 개동여지도에서 찾아보세요.",
  keywords: [
    "반려견 여행",
    "강아지 여행",
    "반려견 동반",
    "강아지 동반 여행",
    "반려견 여행 코스",
    "개동여지도",
  ],
  applicationName: "개동여지도",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "개동여지도",
    title: "개동여지도 | 반려견과 함께 떠나는 맞춤 여행 코스",
    description:
      "우리 강아지와 어디로 떠날지 고민될 때, 취향에 맞는 반려견 동반 여행 코스를 찾아보세요.",
    images: [
      {
        url: "/img/banner.png",
        width: 3840,
        height: 2160,
        alt: "개동여지도 - 반려견과 함께 떠나는 맞춤 여행 코스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "개동여지도 | 반려견과 함께 떠나는 맞춤 여행 코스",
    description:
      "우리 강아지와 어디로 떠날지 고민될 때, 취향에 맞는 반려견 동반 여행 코스를 찾아보세요.",
    images: ["/img/banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AppFlowProvider>{children}</AppFlowProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
