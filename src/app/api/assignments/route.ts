import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AssignmentSubmission } from "@/models/Submission";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const submissionSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  assignmentId: z.string().min(1, "Assignment ID is required"),
  moduleId: z.string().optional(),
  submissionType: z.enum(["link", "text"]),
  content: z.string().min(1, "Content is required"),
});

// POST - Submit an assignment
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Validate input
    const validationResult = submissionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { courseId, assignmentId, moduleId, submissionType, content } = validationResult.data;

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: user._id,
      course: courseId,
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Check if assignment exists in the course
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const assignment = course.assignments.find(
      (a) => a._id.toString() === assignmentId
    );
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check for existing submission
    const existingSubmission = await AssignmentSubmission.findOne({
      student: user._id,
      course: courseId,
      assignmentId,
    });

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.submissionType = submissionType;
      existingSubmission.content = content;
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = "pending";
      existingSubmission.grade = undefined;
      existingSubmission.feedback = undefined;
      await existingSubmission.save();

      return NextResponse.json({
        success: true,
        message: "Assignment resubmitted successfully",
        submission: existingSubmission,
      });
    }

    // Create new submission
    const submissionData: {
      student: typeof user._id;
      course: string;
      assignmentId: string;
      moduleId?: string;
      submissionType: string;
      content: string;
    } = {
      student: user._id,
      course: courseId,
      assignmentId,
      submissionType,
      content,
    };

    // Only include moduleId if it's a valid string
    if (moduleId && moduleId !== "undefined") {
      submissionData.moduleId = moduleId;
    }

    const submission = await AssignmentSubmission.create(submissionData);

    return NextResponse.json(
      {
        success: true,
        message: "Assignment submitted successfully",
        submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Assignment submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}

// GET - Get student's submissions
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const query: Record<string, unknown> = { student: user._id };
    if (courseId) {
      query.course = courseId;
    }

    const submissions = await AssignmentSubmission.find(query)
      .populate("course", "title slug")
      .sort({ submittedAt: -1 });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: "Failed to get submissions" },
      { status: 500 }
    );
  }
}
