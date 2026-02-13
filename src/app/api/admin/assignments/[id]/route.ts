import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AssignmentSubmission } from "@/models/Submission";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const gradeSchema = z.object({
  grade: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

// PATCH - Grade an assignment submission
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    // Validate input
    const validationResult = gradeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { grade, feedback } = validationResult.data;

    const submission = await AssignmentSubmission.findByIdAndUpdate(
      id,
      {
        grade,
        feedback,
        status: "graded",
        gradedAt: new Date(),
        gradedBy: user._id,
      },
      { new: true }
    )
      .populate("student", "name email")
      .populate("course", "title");

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Assignment graded successfully",
      submission,
    });
  } catch (error) {
    console.error("Grade assignment error:", error);
    return NextResponse.json(
      { error: "Failed to grade assignment" },
      { status: 500 }
    );
  }
}

// GET - Get single submission
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const submission = await AssignmentSubmission.findById(id)
      .populate("student", "name email avatar")
      .populate("course", "title slug assignments modules");

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json(
      { error: "Failed to get submission" },
      { status: 500 }
    );
  }
}
