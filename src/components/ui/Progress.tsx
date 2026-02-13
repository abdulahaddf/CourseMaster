"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  animated?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = false,
      size = "default",
      variant = "default",
      animated = false,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
      sm: "h-1.5",
      default: "h-2.5",
      lg: "h-4",
    };

    const variants = {
      default: "bg-primary-500",
      success: "bg-accent-500",
      warning: "bg-amber-500",
      danger: "bg-red-500",
    };

    return (
      <div className="w-full space-y-1">
        {showLabel && (
          <div className="flex justify-between text-sm">
            <span className="text-surface-600">Progress</span>
            <span className="font-medium text-surface-900">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          ref={ref}
          className={cn(
            "w-full overflow-hidden rounded-full bg-surface-100",
            sizes[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variants[variant],
              animated && "progress-animated"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
