"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import { BookOpen, Mail, Lock, User, ArrowLeft, Key, CheckCircle } from "lucide-react";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register as registerUser, clearError } from "@/store/slices/authSlice";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  // Password strength indicators
  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
  ];

  const onSubmit = async (data: RegisterInput) => {
    dispatch(clearError());

    try {
      const result = await dispatch(
        registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
          adminKey: data.adminKey,
        })
      ).unwrap();

      toast.success("Account created successfully!", {
        description: `Welcome, ${result.name}!`,
      });

      // Redirect based on role
      if (result.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Please try again";
      toast.error("Registration failed", {
        description: message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200 rounded-full blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-surface-600 hover:text-surface-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card variant="elevated" className="shadow-2xl">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 mb-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
                <BookOpen className="h-6 w-6" />
              </div>
            </Link>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Join thousands of learners and start your journey
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordChecks.map((check, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-xs ${
                          check.valid ? "text-accent-600" : "text-surface-400"
                        }`}
                      >
                        <CheckCircle
                          className={`w-3 h-3 ${
                            check.valid ? "opacity-100" : "opacity-30"
                          }`}
                        />
                        {check.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              {/* Admin Registration Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdmin(!isAdmin)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {isAdmin ? "Hide admin registration" : "Register as Admin?"}
                </button>

                {isAdmin && (
                  <div className="mt-3 animate-fade-in">
                    <Input
                      label="Admin Key"
                      type="password"
                      placeholder="Enter admin registration key"
                      leftIcon={<Key className="w-4 h-4" />}
                      helperText="Contact system administrator for the admin key"
                      {...register("adminKey")}
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-surface-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              <Link href="/login" className="mt-4 block">
                <Button variant="outline" className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-surface-500 mt-6">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-primary-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
