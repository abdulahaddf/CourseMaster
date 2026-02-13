// App Configuration
export const APP_CONFIG = {
  name: "CourseMaster",
  description: "Learn from the best instructors worldwide",
  tagline: "Master Your Skills, Shape Your Future",
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  itemsPerPage: 12,
} as const;

// Authentication
export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiresIn: "7d",
  cookieName: "auth_token",
  adminKey: process.env.ADMIN_REGISTRATION_KEY || "ADMIN_SECRET_2024",
} as const;

// Course Categories
export const COURSE_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "UI/UX Design",
  "Digital Marketing",
  "Business",
] as const;

// Course Levels
export const COURSE_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

// Theme Colors
export const THEME_COLORS = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  accent: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    600: "#16a34a",
  },
} as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];
export type CourseLevel = (typeof COURSE_LEVELS)[number];
