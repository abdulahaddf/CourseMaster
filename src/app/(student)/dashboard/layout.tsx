import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/dashboard";
import { ReactNode } from "react";

export default async function StudentDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Redirect admin to admin dashboard
  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  const userData = {
    name: user.name,
    email: user.email,
    role: user.role as "student"| "admin",
    avatar: user.avatar,
  };

  return <DashboardLayout user={userData}>{children}</DashboardLayout>;
}
