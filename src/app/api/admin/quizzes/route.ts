import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { QuizAttempt } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";

// GET - Get all quiz attempts for admin review
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const passed = searchParams.get("passed");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: Record<string, unknown> = {};
    if (courseId) query.course = courseId;
    if (passed === "true") query.passed = true;
    if (passed === "false") query.passed = false;

    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      QuizAttempt.find(query)
        .populate("student", "name email avatar")
        .populate("course", "title slug quizzes")
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit),
      QuizAttempt.countDocuments(query),
    ]);

    return NextResponse.json({
      attempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get quiz attempts error:", error);
    return NextResponse.json(
      { error: "Failed to get quiz attempts" },
      { status: 500 }
    );
  }
}
