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
  {
    value: "course",
    label: "코스",
    icon: "pawFill",
    activeIcon: "pawFill",
  },
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
        "flex min-h-[70px] border-t border-gray-50 bg-white px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
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
              "flex flex-1 flex-col items-center justify-center gap-1",
              active
                ? "type-caption-sb-12 text-gray-900"
                : "type-caption-r-12 text-gray-200"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              name={active ? item.activeIcon : item.icon}
              className={cn(
                "size-6",
                !active && item.value === "course" && "opacity-[0.41]"
              )}
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
