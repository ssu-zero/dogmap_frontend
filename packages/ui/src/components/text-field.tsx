import type { ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const textFieldVariants = cva(
  "flex w-full items-center rounded-full bg-gray-50 px-8 py-4 transition-shadow",
  {
    variants: {
      state: {
        default: "text-gray-150",
        writing: "border border-gray-150 text-gray-800",
        completed: "text-gray-800",
      },
    },
    defaultVariants: { state: "default" },
  }
)
type TextFieldProps = Omit<ComponentProps<"input">, "size"> &
  VariantProps<typeof textFieldVariants>
function TextField({ state, className, ...props }: TextFieldProps) {
  return (
    <input
      className={cn(
        textFieldVariants({ state }),
        "text-[17px] leading-[1.412] font-medium placeholder:text-gray-150 focus:outline-none",
        className
      )}
      {...props}
    />
  )
}
export { TextField, textFieldVariants }
export type { TextFieldProps }
