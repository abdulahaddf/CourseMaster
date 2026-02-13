import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "./constants";
import { connectDB } from "./db";
import User, { IUser } from "@/models/User";

export interface JWTPayload {
  userId: string;
  email: string;
  role: "student" | "admin";
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, AUTH_CONFIG.jwtSecret, {
    expiresIn: AUTH_CONFIG.jwtExpiresIn,
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, AUTH_CONFIG.jwtSecret) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_CONFIG.cookieName)?.value || null;
}

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const token = await getAuthToken();
    
    if (!token) return null;
    
    const payload = verifyToken(token);
    
    if (!payload) return null;
    
    await connectDB();
    
    const user = await User.findById(payload.userId).select("-password");
    
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<IUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return user;
}

export async function requireAdmin(): Promise<IUser> {
  const user = await requireAuth();
  
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  
  return user;
}

export function setAuthCookie(token: string): string {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  return `${AUTH_CONFIG.cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
}

export function clearAuthCookie(): string {
  return `${AUTH_CONFIG.cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
