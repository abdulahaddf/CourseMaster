"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline" | "info";
  size?: "sm" | "default" | "lg";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-primary-100 text-primary-800 border-primary-200",
      secondary: "bg-surface-100 text-surface-800 border-surface-200",
      success: "bg-accent-100 text-accent-800 border-accent-200",
      warning: "bg-amber-100 text-amber-800 border-amber-200",
      danger: "bg-red-100 text-red-800 border-red-200",
      outline: "bg-transparent border-2 border-surface-300 text-surface-700",
      info: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      default: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium border transition-colors",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
