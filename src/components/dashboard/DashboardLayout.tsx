"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

interface DashboardLayoutProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    role: "student" | "admin";
    avatar?: string;
  };
}

const sidebarLinks = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: GraduationCap,
    label: "My Courses",
    href: "/dashboard/courses",
  },
  {
    icon: ClipboardList,
    label: "Assignments",
    href: "/dashboard/assignments",
  },
  // {
  //   icon: Award,
  //   label: "Certificates",
  //   href: "/dashboard/certificates",
  // },
  // {
  //   icon: Settings,
  //   label: "Settings",
  //   href: "/dashboard/settings",
  // },
];

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-surface-200 transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-surface-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-surface-900">
              {APP_CONFIG.name}
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto p-2 hover:bg-surface-100 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive(link.href)
                  ? "bg-primary-50 text-primary-700"
                  : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-surface-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-surface-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-surface-200">
          <div className="flex h-full items-center justify-between px-4 lg:px-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-surface-600 hover:bg-surface-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-surface-900">
                {sidebarLinks.find((link) => isActive(link.href))?.label ||
                  "Dashboard"}
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-surface-500 hover:bg-surface-100 hover:text-surface-900 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-surface-200 bg-white p-1.5 pr-3 transition-all hover:border-primary-300 hover:shadow-md"
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    fallback={user.name}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-surface-700 hidden sm:block">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-surface-400 transition-transform",
                      isUserMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-surface-200 bg-white p-2 shadow-lg animate-fade-in">
                      <div className="border-b border-surface-100 px-3 py-2 mb-2">
                        <p className="text-sm font-medium text-surface-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-surface-500">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
