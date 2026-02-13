"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { Avatar } from "@/components/ui";
import {
  BookOpen,
  Menu,
  X,
  Search,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    role: "student" | "admin";
    avatar?: string;
  } | null;
}

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="glass border-b border-surface-200/50">
        <div className="container-custom">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform hover:scale-105"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-surface-900">
                {APP_CONFIG.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-1 md:flex">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive(link.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-surface-600 hover:text-surface-900 hover:bg-surface-100"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search & User Actions */}
            <div className="hidden items-center gap-3 md:flex">
              {/* Search Button */}
              <button className="flex h-10 w-10 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900">
                <Search className="h-5 w-5" />
              </button>

              {user ? (
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
                    <span className="text-sm font-medium text-surface-700">
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
                          <p className="text-xs text-surface-500">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href={
                            user.role === "admin"
                              ? "/admin/dashboard"
                              : "/dashboard"
                          }
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          Profile
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
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-surface-200 bg-white md:hidden animate-fade-in">
            <div className="container-custom py-4 space-y-2">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive(link.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-surface-600 hover:text-surface-900 hover:bg-surface-100"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-3 border-surface-200" />
              {user ? (
                <>
                  <Link
                    href={
                      user.role === "admin" ? "/admin/dashboard" : "/dashboard"
                    }
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-surface-600 rounded-lg hover:bg-surface-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="flex-1">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
