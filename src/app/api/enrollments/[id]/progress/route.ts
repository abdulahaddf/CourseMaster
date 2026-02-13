import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { lessonId, moduleId } = await request.json();

    if (!lessonId || !moduleId) {
      return NextResponse.json(
        { success: false, error: "Lesson ID and Module ID are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the enrollment
    const enrollment = await Enrollment.findOne({
      _id: id,
      student: user._id,
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Get course to calculate total lessons
    const course = await Course.findById(enrollment.course);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    // Find or create module progress
    let moduleProgress = enrollment.progress.find(
      (mp) => mp.moduleId.toString() === moduleId
    );

    if (!moduleProgress) {
      enrollment.progress.push({
        moduleId: new mongoose.Types.ObjectId(moduleId),
        lessons: [],
        completed: false,
      });
      moduleProgress = enrollment.progress[enrollment.progress.length - 1];
    }

    // Check if lesson is already completed
    const existingLessonProgress = moduleProgress.lessons.find(
      (lp) => lp.lessonId.toString() === lessonId
    );

    if (existingLessonProgress?.completed) {
      return NextResponse.json({
        success: true,
        message: "Lesson already completed",
        enrollment: {
          completedLessons: enrollment.completedLessons,
          totalLessons: enrollment.totalLessons,
          overallProgress: enrollment.overallProgress,
          isCompleted: enrollment.isCompleted,
        },
      });
    }

    // Update or create lesson progress
    if (existingLessonProgress) {
      existingLessonProgress.completed = true;
      existingLessonProgress.completedAt = new Date();
    } else {
      moduleProgress.lessons.push({
        lessonId: new mongoose.Types.ObjectId(lessonId),
        completed: true,
        watchedDuration: 0,
        completedAt: new Date(),
      });
    }

    // Count completed lessons across all modules
    let completedCount = 0;
    for (const mp of enrollment.progress) {
      for (const lp of mp.lessons) {
        if (lp.completed) {
          completedCount++;
        }
      }
    }

    enrollment.completedLessons = completedCount;
    enrollment.totalLessons = course.totalLessons;

    // Calculate overall progress
    enrollment.overallProgress = Math.round(
      (enrollment.completedLessons / enrollment.totalLessons) * 100
    );

    // Check if course is completed
    if (enrollment.overallProgress >= 100) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
      enrollment: {
        completedLessons: enrollment.completedLessons,
        totalLessons: enrollment.totalLessons,
        overallProgress: enrollment.overallProgress,
        isCompleted: enrollment.isCompleted,
      },
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    const enrollment = await Enrollment.findOne({
      _id: id,
      student: user._id,
    }).populate({
      path: "course",
      select: "title slug totalLessons",
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
