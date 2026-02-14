"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  DollarSign,
  FileText,
  Bell,
  GraduationCap,
  HelpCircle,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/dashboard/users",
    icon: Users,
  },
  {
    title: "Courses",
    href: "/admin/dashboard/courses",
    icon: BookOpen,
  },
  {
    title: "Enrollments",
    href: "/admin/dashboard/enrollments",
    icon: GraduationCap,
  },
  {
    title: "Assignments",
    href: "/admin/dashboard/assignments",
    icon: FileText,
  },
  {
    title: "Quizzes",
    href: "/admin/dashboard/quizzes",
    icon: HelpCircle,
  },
  // {
  //   title: "Transactions",
  //   href: "/admin/dashboard/transactions",
  //   icon: DollarSign,
  // },
  {
    title: "Analytics",
    href: "/admin/dashboard/analytics",
    icon: BarChart3,
  },
  // {
  //   title: "Reports",
  //   href: "/admin/dashboard/reports",
  //   icon: FileText,
  // },
  // {
  //   title: "Settings",
  //   href: "/admin/dashboard/settings",
  //   icon: Settings,
  // },
];

export function AdminLayout({ children, user }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-surface-800 border-r border-surface-700 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-surface-700">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">Admin</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-surface-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-surface-300 hover:bg-surface-700 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-700">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/50">
            <Avatar src={user.avatar} name={user.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-surface-400 truncate">Administrator</p>
            </div>
          </div>
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-2 w-full px-4 py-2 mt-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-surface-800 border-b border-surface-700 flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-surface-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-white">
              {sidebarItems.find(
                (item) =>
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href))
              )?.title || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-surface-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link
              href="/"
              className="text-sm text-surface-400 hover:text-white"
            >
              View Site
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 bg-surface-50 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
