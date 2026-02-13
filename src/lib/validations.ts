import { z } from "zod";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "./constants";

// Auth Schemas
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
  adminKey: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// API schema for registration (without confirmPassword - validated on client)
export const registerApiSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  adminKey: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Course Schemas
export const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  description: z.string().optional(),
  videoUrl: z.string().url("Please enter a valid video URL"),
  duration: z.number().min(0).optional(),
  order: z.number().min(0),
  isFree: z.boolean().optional(),
});

export const moduleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  description: z.string().optional(),
  order: z.number().min(0),
  lessons: z.array(lessonSchema).optional(),
});

export const batchSchema = z.object({
  name: z.string().min(1, "Batch name is required"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  maxStudents: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const quizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).min(2, "At least 2 options required"),
  correctAnswer: z.number().min(0),
  points: z.number().min(1).optional(),
});

export const quizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  moduleId: z.string(),
  questions: z.array(quizQuestionSchema).min(1, "At least 1 question required"),
  passingScore: z.number().min(0).max(100).optional(),
  timeLimit: z.number().min(1).optional(),
});

export const assignmentSchema = z.object({
  title: z.string().min(1, "Assignment title is required"),
  description: z.string().min(1, "Description is required"),
  moduleId: z.string(),
  dueDate: z.string().or(z.date()).optional(),
  maxScore: z.number().min(1).optional(),
});

export const courseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().max(300).optional(),
  thumbnail: z.string().url().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  discountPrice: z.number().min(0).optional(),
  category: z.enum(COURSE_CATEGORIES as unknown as [string, ...string[]]),
  tags: z.array(z.string()).optional(),
  level: z.enum(COURSE_LEVELS),
  language: z.string().optional(),
  modules: z.array(moduleSchema).optional(),
  batches: z.array(batchSchema).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

// Assignment Submission
export const assignmentSubmissionSchema = z.object({
  submissionUrl: z.string().url("Please enter a valid URL (e.g., Google Drive link)"),
  submissionText: z.string().optional(),
});

// Quiz Attempt
export const quizAttemptSchema = z.object({
  answers: z.array(z.number()),
});

// Course Query Params
export const courseQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("12"),
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(["newest", "oldest", "price_low", "price_high", "popular", "rating"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type BatchInput = z.infer<typeof batchSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type CourseQueryInput = z.infer<typeof courseQuerySchema>;
