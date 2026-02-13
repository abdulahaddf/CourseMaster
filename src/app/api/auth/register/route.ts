import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";
import { registerApiSchema } from "@/lib/validations";
import { AUTH_CONFIG } from "@/lib/constants";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Validate input
    const validationResult = registerApiSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message);
      return NextResponse.json(
        { error: errors[0] },
        { status: 400 }
      );
    }
    
    const { name, email, password, adminKey } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }
    
    // Determine role
    const role = adminKey === AUTH_CONFIG.adminKey ? "admin" : "student";
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });
    
    // Send welcome email (async, don't block registration)
    sendWelcomeEmail(user.email, user.name).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });
    
    // Generate token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
      { status: 201 }
    );
    
    // Set auth cookie
    response.headers.set("Set-Cookie", setAuthCookie(token));
    
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
