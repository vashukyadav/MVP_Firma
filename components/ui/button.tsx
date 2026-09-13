import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 cursor-pointer aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-forest text-white hover:bg-forest-hover shadow-xs active:bg-forest-hover/95",
        outline:
          "border-pebble bg-white text-onyx hover:bg-stone hover:text-onyx active:bg-mist/80 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-breath text-onyx hover:bg-breath/80 active:bg-breath/70",
        ghost:
          "hover:bg-mist/70 hover:text-onyx text-ash active:bg-mist",
        destructive:
          "bg-hazard-bg text-hazard-text border border-hazard/20 hover:bg-hazard hover:text-white focus-visible:border-destructive/40 focus-visible:ring-destructive/20 transition",
        link: "text-forest underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4 py-2 text-sm font-medium",
        xs: "h-7 gap-1 rounded-[6px] px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8.5 gap-1.5 rounded-[8px] px-3 text-xs font-medium [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 px-5 text-sm font-semibold rounded-[10px] [&_svg:not([class*='size-'])]:size-4",
        icon: "size-10 rounded-[10px]",
        "icon-xs": "size-7 rounded-[6px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8.5 rounded-[8px]",
        "icon-lg": "size-11 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
