import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Course from "@/models/Course";
import User from "@/models/User";
import { AssignmentSubmission, QuizAttempt } from "@/models/Submission";

// GET - Get analytics data for admin dashboard
export async function GET() {
  try {
    await connectDB();

    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Run all analytics queries in parallel
    const [
      // Overview stats
      totalUsers,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      completedEnrollments,
      
      // Recent activity
      newUsersLast7Days,
      newEnrollmentsLast7Days,
      
      // Enrollments over time (last 30 days)
      enrollmentsByDay,
      
      // Top courses by enrollment
      topCourses,
      
      // Course completion rate
      courseCompletionStats,
      
      // User registrations over time
      userRegistrationsByDay,
      
      // Quiz and assignment stats
      totalQuizAttempts,
      totalAssignmentSubmissions,
      pendingAssignments,
      
      // Revenue (if tracking)
      revenueByMonth,
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ isCompleted: true }),
      
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Enrollment.countDocuments({ enrolledAt: { $gte: sevenDaysAgo } }),
      
      // Enrollments by day (last 30 days)
      Enrollment.aggregate([
        { $match: { enrolledAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      
      // Top 5 courses by enrollment
      Enrollment.aggregate([
        {
          $group: {
            _id: "$course",
            enrollments: { $sum: 1 },
            completions: { $sum: { $cond: ["$isCompleted", 1, 0] } },
          },
        },
        { $sort: { enrollments: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "courses",
            localField: "_id",
            foreignField: "_id",
            as: "course",
          },
        },
        { $unwind: "$course" },
        {
          $project: {
            _id: 1,
            enrollments: 1,
            completions: 1,
            title: "$course.title",
            category: "$course.category",
          },
        },
      ]),
      
      // Completion rate by level
      Enrollment.aggregate([
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseData",
          },
        },
        { $unwind: "$courseData" },
        {
          $group: {
            _id: "$courseData.level",
            total: { $sum: 1 },
            completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
          },
        },
      ]),
      
      // User registrations by day (last 30 days)
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      
      QuizAttempt.countDocuments(),
      AssignmentSubmission.countDocuments(),
      AssignmentSubmission.countDocuments({ status: "pending" }),
      
      // Revenue by month (last 6 months) - based on enrollments and course prices
      Enrollment.aggregate([
        {
          $match: {
            enrolledAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            },
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseData",
          },
        },
        { $unwind: "$courseData" },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$enrolledAt" },
            },
            revenue: {
              $sum: {
                $ifNull: ["$courseData.discountPrice", "$courseData.price"],
              },
            },
            enrollments: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Fill in missing days for enrollments chart
    const enrollmentsChart = fillMissingDays(enrollmentsByDay, thirtyDaysAgo, now);
    const registrationsChart = fillMissingDays(userRegistrationsByDay, thirtyDaysAgo, now);

    // Calculate completion rate
    const overallCompletionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        completedEnrollments,
        overallCompletionRate,
        newUsersLast7Days,
        newEnrollmentsLast7Days,
        totalQuizAttempts,
        totalAssignmentSubmissions,
        pendingAssignments,
      },
      charts: {
        enrollmentsOverTime: enrollmentsChart,
        userRegistrations: registrationsChart,
        topCourses,
        completionByLevel: courseCompletionStats,
        revenueByMonth,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// Helper function to fill missing days in time series data
function fillMissingDays(
  data: { _id: string; count: number }[],
  startDate: Date,
  endDate: Date
): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const dataMap = new Map(data.map((d) => [d._id, d.count]));

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      count: dataMap.get(dateStr) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}
