"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { toast } from "sonner";

interface EnrollButtonProps {
  courseId: string;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  courseSlug: string;
  size?: "sm" | "default" | "lg";
}

export function EnrollButton({
  courseId,
  isEnrolled,
  isLoggedIn,
  courseSlug,
  size = "lg",
}: EnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${courseSlug}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll");
      }

      toast.success("Successfully enrolled!", {
        description: "You can now access the course content.",
      });

      router.push(`/dashboard/courses/${courseSlug}`);
      router.refresh();
    } catch (error) {
      toast.error("Enrollment failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <Button
        size={size}
        className="w-full"
        onClick={() => router.push(`/dashboard/courses/${courseSlug}`)}
      >
        Continue Learning
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className="w-full"
      onClick={handleEnroll}
      isLoading={isLoading}
    >
      {isLoggedIn ? "Enroll Now" : "Login to Enroll"}
    </Button>
  );
}
