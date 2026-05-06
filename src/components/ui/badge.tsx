import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit max-w-full items-center justify-center gap-1 overflow-hidden rounded-none px-2 py-0.5 text-center text-[11px] font-bold uppercase leading-tight tracking-[0.12em] [overflow-wrap:anywhere] [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[2px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary/15 text-primary [a&]:hover:bg-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:text-primary",
        destructive:
          "bg-destructive/10 text-destructive [a&]:hover:bg-destructive [a&]:hover:text-white focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-border bg-transparent text-muted-foreground [a&]:hover:border-primary [a&]:hover:text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
