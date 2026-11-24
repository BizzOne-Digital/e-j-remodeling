import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 rounded-lg font-btn font-semibold text-center transition duration-200 disabled:opacity-60 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "grad text-white border border-bright/50 shadow-[0_8px_22px_-10px_#0078d4] hover:brightness-110 hover:-translate-y-0.5",
        outline: "border-2 border-bright/70 text-white bg-ink/50 hover:bg-primary/25 hover:border-bright hover:-translate-y-0.5",
        light: "border border-line bg-white text-dark hover:border-primary hover:text-royal",
        danger: "bg-red-700 text-white hover:bg-red-800",
        ghost: "text-dark hover:bg-mist",
      },
      size: { sm: "min-h-10 px-3.5 text-sm", md: "min-h-12 px-6 text-[0.95rem]", lg: "min-h-14 px-7 text-base", icon: "size-11" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
export function Button({ className, variant, size, asChild, ...p }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const C = asChild ? Slot : "button";
  return <C className={cn(buttonVariants({ variant, size }), className)} {...p} />;
}
