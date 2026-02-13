/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { getCurrentUser } from "@/lib/auth";
import { sendEnrollmentEmail } from "@/lib/email";

// POST - Enroll in a course
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please login to enroll" },
        { status: 401 }
      );
    }

    await connectDB();

    const { courseId, batchId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Check if course exists
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "You are already enrolled in this course" },
        { status: 400 }
      );
    }

    // Initialize progress for all modules and lessons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progress = course.modules.map((module: any) => ({
      moduleId: module._id,
      lessons: module.lessons.map((lesson: any) => ({
        lessonId: lesson._id,
        completed: false,
        watchedDuration: 0,
      })),
      completed: false,
    }));

    // Calculate total lessons
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalLessons = course.modules.reduce(
      (acc: number, mod: any) => acc + mod.lessons.length,
      0
    );

    // Create enrollment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollmentData = {
      student: user._id,
      course: courseId,
      batch: batchId || null,
      progress,
      totalLessons,
      overallProgress: 0,
      completedLessons: 0,
    } as any;
    const enrollment = await Enrollment.create(enrollmentData);
    const enrollmentDoc = Array.isArray(enrollment) ? enrollment[0] : enrollment;

    // Update course enrolled count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledCount: 1 },
    });

    // If batch specified, update batch enrolled count
    if (batchId) {
      await Course.updateOne(
        { _id: courseId, "batches._id": batchId },
        { $inc: { "batches.$.enrolledCount": 1 } }
      );
    }

    // Send enrollment confirmation email (async, don't block enrollment)
    sendEnrollmentEmail(user.email, user.name, course.title).catch((err) => {
      console.error("Failed to send enrollment email:", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully enrolled in the course",
        enrollment: {
          _id: enrollmentDoc._id,
          course: courseId,
          enrolledAt: enrollmentDoc.enrolledAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    );
  }
}

// GET - Get user's enrollments
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please login to view enrollments" },
        { status: 401 }
      );
    }

    await connectDB();

    const enrollments = await Enrollment.find({ student: user._id })
      .populate({
        path: "course",
        select:
          "title slug thumbnail instructorName category level totalDuration totalLessons",
      })
      .sort({ enrolledAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      enrollments: JSON.parse(JSON.stringify(enrollments)),
    });
  } catch (error) {
    console.error("Fetch enrollments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
