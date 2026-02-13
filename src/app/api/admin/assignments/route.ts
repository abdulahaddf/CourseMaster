import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AssignmentSubmission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";

// GET - Get all submissions for admin review
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const query: Record<string, unknown> = {};
    if (courseId) query.course = courseId;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      AssignmentSubmission.find(query)
        .populate("student", "name email avatar")
        .populate("course", "title slug assignments")
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
      AssignmentSubmission.countDocuments(query),
    ]);

    return NextResponse.json({
      submissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get submissions error:", error);
    return NextResponse.json(
      { error: "Failed to get submissions" },
      { status: 500 }
    );
  }
}
