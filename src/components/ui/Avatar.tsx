"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  name?: string;
  size?: "sm" | "default" | "md" | "lg" | "xl";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, name, size = "default", ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    const sizes = {
      sm: "h-8 w-8 text-xs",
      default: "h-10 w-10 text-sm",
      md: "h-11 w-11 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    const getFallbackText = () => {
      if (fallback) return fallback.slice(0, 2).toUpperCase();
      if (name) return name.slice(0, 2).toUpperCase();
      if (alt) return alt.slice(0, 2).toUpperCase();
      return "U";
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-700 font-semibold",
          sizes[size],
          className
        )}
        {...props}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span>{getFallbackText()}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
