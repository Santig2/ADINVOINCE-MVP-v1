import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-dark via-primary to-primary-light text-white shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 border border-white/10 dark:border-white/5',
        accent: 'bg-gradient-to-br from-accent-warm to-orange-500 text-white shadow-[0_8px_16px_-6px_rgba(255,100,50,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(255,100,50,0.6)] hover:-translate-y-0.5 border border-white/20',
        destructive:
          'bg-gradient-to-br from-destructive to-red-600 text-white hover:opacity-90 shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-white/10',
        outline:
          'border bg-background/50 backdrop-blur-sm shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:-translate-y-0.5 dark:border-white/10',
        secondary:
          'bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary shadow-sm border border-transparent dark:border-white/5',
        ghost:
          'hover:bg-primary/10 hover:text-primary dark:hover:bg-primary-light/10 transition-colors',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary-light',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      suppressHydrationWarning
      {...props}
    />
  )
}

export { Button, buttonVariants }
