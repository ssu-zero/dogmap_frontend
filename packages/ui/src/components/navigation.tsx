import type { ComponentProps } from "react"

import { Icon, type IconName } from "@workspace/ui/components/icon"
import { cn } from "@workspace/ui/lib/utils"

type NavigationItem = {
  value: string
  label: string
  icon: IconName
  activeIcon: IconName
}
const defaultNavigationItems: NavigationItem[] = [
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

type BottomNavigationProps = Omit<ComponentProps<"nav">, "onChange"> & {
  value: string
  onValueChange?: (value: string) => void
  items?: NavigationItem[]
}
function BottomNavigation({
  value,
  onValueChange,
  items = defaultNavigationItems,
  className,
  ...props
}: BottomNavigationProps) {
  return (
    <nav
      className={cn(
        "flex h-20 border-t border-gray-100 bg-white px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange?.(item.value)}
            className={cn(
              "type-caption-r-10 flex flex-1 flex-col items-center justify-center gap-1",
              active ? "text-gray-900" : "text-gray-200"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              name={active ? item.activeIcon : item.icon}
              className="size-6"
            />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
export { BottomNavigation, defaultNavigationItems }
export type { BottomNavigationProps, NavigationItem }
