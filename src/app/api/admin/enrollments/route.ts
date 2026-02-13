import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";

// GET - Get all enrollments (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const courseId = searchParams.get("courseId");
    const batchId = searchParams.get("batchId");
    const status = searchParams.get("status"); // active, completed, all
    const search = searchParams.get("search");

    // Build query
    const query: Record<string, unknown> = {};

    if (courseId) {
      query.course = courseId;
    }

    if (batchId) {
      query.batch = batchId;
    }

    if (status === "completed") {
      query.isCompleted = true;
    } else if (status === "active") {
      query.isCompleted = false;
    }

    // Run queries in parallel to prevent N+1 problem
    const [enrollments, total, courses, totalEnrollments, activeEnrollments, completedEnrollments] = await Promise.all([
      Enrollment.find(query)
        .populate("student", "name email avatar")
        .populate("course", "title slug thumbnail category batches")
        .sort({ enrolledAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Enrollment.countDocuments(query),
      Course.find({}, "title slug batches").lean(),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ isCompleted: false }),
      Enrollment.countDocuments({ isCompleted: true }),
    ]);

    // Filter by search if provided (in-memory filter after fetch)
    let filteredEnrollments = enrollments;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEnrollments = enrollments.filter((enrollment) => {
        const student = enrollment.student as { name?: string; email?: string };
        const course = enrollment.course as { title?: string };
        return (
          student?.name?.toLowerCase().includes(searchLower) ||
          student?.email?.toLowerCase().includes(searchLower) ||
          course?.title?.toLowerCase().includes(searchLower)
        );
      });
    }

    return NextResponse.json({
      enrollments: JSON.parse(JSON.stringify(filteredEnrollments)),
      courses: JSON.parse(JSON.stringify(courses)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
      },
    });
  } catch (error) {
    console.error("Admin enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
