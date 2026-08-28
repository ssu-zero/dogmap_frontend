import type { ComponentProps } from "react"

import { cn } from "@workspace/ui/lib/utils"

const iconSources = {
  arrowDown: new URL("../svg/arrow/down.svg", import.meta.url).href,
  arrowLeft: new URL("../svg/arrow/left.svg", import.meta.url).href,
  arrowRight: new URL("../svg/arrow/right.svg", import.meta.url).href,
  bookmarkFill: new URL("../svg/bookmark_fill.svg", import.meta.url).href,
  bookmarkLine: new URL("../svg/bookmark_line.svg", import.meta.url).href,
  bone: new URL("../svg/illust/bone.svg", import.meta.url).href,
  chatFill: new URL("../svg/chat_fill.svg", import.meta.url).href,
  chatLine: new URL("../svg/chat_line.svg", import.meta.url).href,
  checkFill: new URL("../svg/check_fill.svg", import.meta.url).href,
  checkLine: new URL("../svg/check_line.svg", import.meta.url).href,
  close: new URL("../svg/close.svg", import.meta.url).href,
  homeFill: new URL("../svg/home_fill.svg", import.meta.url).href,
  homeLine: new URL("../svg/home_line.svg", import.meta.url).href,
  location: new URL("../svg/location.svg", import.meta.url).href,
  more: new URL("../svg/more.svg", import.meta.url).href,
  pawFill: new URL("../svg/paw_fill.svg", import.meta.url).href,
  plus: new URL("../svg/plus.svg", import.meta.url).href,
  profileFill: new URL("../svg/profile_fill.svg", import.meta.url).href,
  profileLine: new URL("../svg/profile_line.svg", import.meta.url).href,
} as const

type IconName = keyof typeof iconSources
type IconProps = Omit<ComponentProps<"img">, "src" | "alt"> & {
  name: IconName
  label?: string
}

function Icon({ name, label, className, ...props }: IconProps) {
  return (
    <img
      src={iconSources[name]}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      className={cn("block shrink-0 object-contain", className)}
      {...props}
    />
  )
}

export { Icon, iconSources }
export type { IconName, IconProps }
