"use client"

import {
  BottomNavigation,
  type NavigationItem,
} from "@workspace/ui/components/navigation"
import { usePathname, useRouter } from "next/navigation"
import type { ReactNode } from "react"

const tabs = {
  home: "/",
  course: "/courses",
  archive: "/archive",
  community: "/community",
  mypage: "/mypage",
} as const

const communityNavigationItems: NavigationItem[] = [
  { value: "home", label: "홈", icon: "homeLine", activeIcon: "homeFill" },
  { value: "course", label: "코스", icon: "location", activeIcon: "location" },
  {
    value: "community",
    label: "커뮤니티",
    icon: "chatLine",
    activeIcon: "chatFill",
  },
  {
    value: "mypage",
    label: "마이페이지",
    icon: "profileLine",
    activeIcon: "profileFill",
  },
]

function AppShell({
  children,
  tab,
}: {
  children: ReactNode
  tab?: keyof typeof tabs
}) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <main className="layout-mobile flex min-h-svh flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {tab ? (
        <BottomNavigation
          value={tab}
          items={tab === "community" ? communityNavigationItems : undefined}
          onValueChange={(value) =>
            router.push(tabs[value as keyof typeof tabs])
          }
          aria-label="주요 메뉴"
        />
      ) : null}
      <span className="sr-only">현재 경로 {pathname}</span>
    </main>
  )
}

export { AppShell }
