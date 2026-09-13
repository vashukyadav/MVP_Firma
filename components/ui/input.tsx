import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-[10px] border border-pebble bg-white px-3.5 py-2 text-sm text-onyx shadow-2xs transition-colors placeholder:text-ash outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-onyx focus-visible:border-forest focus-visible:ring-2 focus-visible:ring-forest/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-stone disabled:opacity-60 aria-invalid:border-hazard aria-invalid:ring-2 aria-invalid:ring-hazard/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
