import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLayout } from "@/components/dashboard/AdminLayout";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AdminLayout
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }}
    >
      {children}
    </AdminLayout>
  );
}
