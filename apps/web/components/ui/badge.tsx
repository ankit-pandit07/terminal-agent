import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-blue-600/15 text-blue-400 border-blue-500/20",
        secondary:
          "border border-zinc-800 bg-zinc-800/80 text-zinc-300",
        destructive:
          "border border-red-500/20 bg-red-500/15 text-red-400",
        success:
          "border border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
        warning:
          "border border-amber-500/20 bg-amber-500/15 text-amber-400",
        info:
          "border border-sky-500/20 bg-sky-500/15 text-sky-400",
        outline: "border border-zinc-800 text-zinc-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
